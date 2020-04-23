import mysql from 'mysql';
import moment, { DATETIME_TO_API_FORMAT } from './moment';
import User from './user';
import School from './school';
import Team from './team';
import District from './district';
import ArbiterExport from './arbiter_export';
import Game from './game';
import { GameStatus, TeamKind, UserStatus, Roles } from './enums';
import * as assert from 'assert';

let connection: mysql.Connection;
const promisifiedQuery = (q: string): Promise<any> => new Promise((resolve, reject) => {
  connection!.query(q, (err, result) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(result);
  });
});

const Q_ALL_USER = 'SELECT * FROM USER;';
const Q_ALL_DISTRICT = 'SELECT * FROM DISTRICT;';
const Q_ALL_SCHOOL = 'SELECT * FROM SCHOOL;';
const Q_ALL_TEAM = 'SELECT * FROM TEAM;';
const Q_ALL_SCHOOL_REP_TEAM_ASSN = 'SELECT * FROM SCHOOL_REP_TEAM_ASSN;';
const Q_ALL_GAME = 'SELECT * FROM GAME;';
const Q_GAME = (gameId: number) => `SELECT * FROM GAME WHERE id=${gameId};`;
const Q_GAME_HISTORY_OF_GAME = (gameId: number) => `SELECT * FROM GAME_HISTORY WHERE gameId=${gameId} ORDER BY timestamp DESC;`;
const Q_ALL_ARBITER_EXPORT = 'SELECT * FROM ARBITER_EXPORT ORDER BY timestamp DESC;';
const Q_ARBITER_EXPORT = (id: number) => `SELECT * FROM ARBITER_EXPORT WHERE id=${id};`;
const Q_EMAIL_SUBSCRIPTIONS = `SELECT * FROM EMAIL_SUBSCRIPTION`;
const Q_EMAIL_SUBSCRIPTION_OF_SUBSCRIBER = (subscriberId: number) => `SELECT * FROM EMAIL_SUBSCRIPTION WHERE subscriberId=${subscriberId};`;
const Q_EMAIL_SUBSCRIPTION = (id: number) => `SELECT * FROM EMAIL_SUBSCRIPTION WHERE id=${id};`;

export default class Repository {
  private users: User[] = []
  private schools: School[] = [];
  private teams: Team[] = [];
  private districts: District[] = [];
  
  constructor(conn: mysql.Connection) {
    connection = conn;
  }

  async init() {
    return this.refresh();
  }

  async refresh() {

    const usersR = await promisifiedQuery(Q_ALL_USER);
    const districtsR = await promisifiedQuery(Q_ALL_DISTRICT);
    const schoolsR = await promisifiedQuery(Q_ALL_SCHOOL);
    const teamsR  = await promisifiedQuery(Q_ALL_TEAM);
    const schoolRepTeamAssnsR = await promisifiedQuery(Q_ALL_SCHOOL_REP_TEAM_ASSN);

    //1 init users
    const users: User[] = usersR.map(row => new User({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role,
      status: row.status,
      schoolId: row.schoolId || null
    }));

    const acceptedUsers = users.filter(u => u.status === UserStatus.ACCEPTED);

    //2 init district
    const districts: District[] = districtsR.map(row => new District({
      id: row.id,
      name: row.name
    }));

    //3 assignors to district
    districtsR.forEach(row => {
      const assignorId: number | null = row.assignorId;
      if (assignorId) {
        const assignor = acceptedUsers.find(u => u.id === assignorId) || null;
        const district = districts.find(d => d.id === row.id);
        district!.assignor = assignor;
      }
    });

    //4 init schools
    const schools: School[] = schoolsR.map(row => new School({
      id: row.id,
      name: row.name,
      isLhsaa: !!row.isLhsaa,
      schoolAdminId: row.schoolAdminId || null
    }));

    //5 schools to district and district to school 
    {
      const districtToSchoolMap: { [districtId: number]: School[]} = {};
      
      schoolsR.forEach((schoolRow, i) => {
        const distId = schoolRow.districtId;

        //null for non lhsaa schools
        if (distId) {
          districtToSchoolMap[distId] = districtToSchoolMap[distId] || [];
          districtToSchoolMap[distId].push(schools[i]);
        }
      });
  
      Object.keys(districtToSchoolMap).forEach(k => {
        const districtId = Number(k);
        const district = districts.find(d => d.id === districtId);
        const schools = districtToSchoolMap[k];
        district!.schools = schools;
      });
    }

    //6 school reps to school and school admin to school
    {
      schools.forEach(school => {
        const schoolReps = acceptedUsers.filter(u => u.schoolId === school.id && u.role === Roles.SCHOOL_REP);
        school.schoolReps = schoolReps;

        const schoolAdmin = school.schoolAdminId? acceptedUsers.find(u => u.id === school.schoolAdminId)!: null;
        school.schoolAdmin = schoolAdmin;
      });
    }

    //7 init teams
    const teams: Team[] = teamsR.map(row => new Team({
      id: row.id,
      name: row.name,
      teamKind: row.teamKind,
      isLhsaa: !!row.isLhsaa,
      schoolId: row.schoolId
    }));

    //8 schoolReps to team
    {
      const teamToSchoolRepMap: { [teamId: number]: User[] } = {};
      
      schoolRepTeamAssnsR.forEach(assnRow => {
        const teamId: number = assnRow.teamId;
        const schoolRepId: number = assnRow.schoolRepId;
        const schoolRep = acceptedUsers.find(u => u.id === schoolRepId);

        teamToSchoolRepMap[teamId] = teamToSchoolRepMap[teamId] || [];
        teamToSchoolRepMap[teamId].push(schoolRep!);
      });

      Object.keys(teamToSchoolRepMap).forEach(k => {
        const teamId = Number(k);
        const team = teams.find(t => t.id === teamId);
        team!.schoolReps = teamToSchoolRepMap[teamId];
      })
    }

    //9 teams to school and school to team
    {
      const schoolToTeamMap: { [schoolId: number]: Team[] } = teams.reduce((acc, team) => {
        acc[team.schoolId] = acc[team.schoolId] || [];
        acc[team.schoolId].push(team);
        return acc;
      }, {});

      Object.keys(schoolToTeamMap).forEach(k => {
        const schoolId = Number(k);
        const school = schools.find(s => s.id === schoolId);
        school!.teams = schoolToTeamMap[schoolId];
        teams.forEach(t => t.school = school!);
      });
    }

    //assigning to property
    this.districts = districts;
    this.schools = schools;
    this.teams = teams;
    this.users = users;
  }

  async getUsers() {
    return [...this.users];
  }

  async getSchools() {
    return [...this.schools];
  }

  async getTeams() {
    return [...this.teams];
  }

  async getTeam(teamId: number) {
    return this.teams.find(t => t.id === teamId) || null;
  }

  async getDistricts() {
    return [...this.districts];
  }

  async getGame(id: number) {
    const rows = await promisifiedQuery(Q_GAME(id));
    if (!rows.length) return null;

    const row = rows[0];

    const g = new Game({
      id: row.id,
      start: moment(row.start),
      location: row.location,
      status: row.status,
    });

    const homeTeamId: number = row.homeTeamId;
    const awayTeamId: number = row.awayTeamId;

    const homeTeam = this.teams.find(t => t.id === homeTeamId);
    const awayTeam = this.teams.find(t => t.id === awayTeamId);
    
    g.homeTeam = homeTeam!;
    g.awayTeam = awayTeam!;

    return g;
  }

  async getGames() {
    const gamesR = await promisifiedQuery(Q_ALL_GAME);
    const games: Game[] = gamesR.map(row => new Game({
      id: row.id,
      start: moment(row.start),
      location: row.location,
      status: row.status,
      rejectionNote: row.rejectionNote
    }));

    gamesR.forEach((gameRow, i) => {
      const homeTeamId: number = gameRow.homeTeamId;
      const awayTeamId: number = gameRow.awayTeamId;

      const homeTeam = this.teams.find(t => t.id === homeTeamId);
      const awayTeam = this.teams.find(t => t.id === awayTeamId);
      const game = games[i];

      game.homeTeam = homeTeam!;
      game.awayTeam = awayTeam!;
    });

    return games;
  }

  async addSchool(o: {
    name: string;
    isLhsaa: boolean;
    schoolAdminId: number | null;
    districtId: number | null;
  }): Promise<number> {

    const query = `
      INSERT INTO SCHOOL (name, isLhsaa, schoolAdminId, districtId) VALUES
      ${sqlValues([o.name, o.isLhsaa, o.schoolAdminId, o.districtId])}`;

    const result: InsertQueryResult = await promisifiedQuery(query);
    assert.ok(result.insertId);

    await this.refresh();

    return result.insertId!;
  }

  async addTeam(o: {
    name: string;
    isLhsaa: boolean;
    teamKind: TeamKind;
    schoolId: number;
  }): Promise<number> {
    const query = `
      INSERT INTO TEAM (name, isLhsaa, teamKind, schoolId) VALUES
      ${sqlValues([o.name, o.isLhsaa, o.teamKind, o.schoolId])}`;

    const result: InsertQueryResult = await promisifiedQuery(query);
    assert.ok(result.insertId);

    await this.refresh();

    return result.insertId!;
  }

  async addGame(g: {
    homeTeamId: number;
    awayTeamId: number;
    start: string | moment.Moment;
    location: string;
    status: GameStatus;
  }): Promise<number> {
    const start = moment(g.start).toISOString();

    const query = `
      INSERT INTO GAME (homeTeamId, awayTeamId, start, location, status, rejectionNote) VALUES
      ${sqlValues([g.homeTeamId, g.awayTeamId, start, g.location, g.status, null])}
    `;

    const result: InsertQueryResult  = await promisifiedQuery(query);
    assert.ok(result.insertId);
    return result.insertId!;
  }

  async getGameHistory(gameId: number) {
    const query = Q_GAME_HISTORY_OF_GAME(gameId);
    const historyR = await promisifiedQuery(query);
    const users = await this.getUsers();

    return historyR.map(row => {

      const history: {[key: string]: any} = {
        id: row.id, 
        gameId: row.gameId, 
        start: moment(row.start).format(DATETIME_TO_API_FORMAT), 
        location: row.location, 
        status: row.status, 
        timestamp: moment(row.timestamp).format(DATETIME_TO_API_FORMAT),
        updateType: row.updateType, 
        updaterType: row.updaterType,
      };

      const updaterId = row.updaterId;
      const updater = users.find(u => u.id === updaterId);
      
      history.updater = {
        id: updater!.id,
        name: updater!.name
      };

      return history;
    });
  }

  async addGameHistory(g: {
    gameId: number, 
    start: string | moment.Moment;
    location: string, 
    status: GameStatus, 
    timestamp: string | moment.Moment;
    updateType: GameHistoryUpdateType, 
    updaterId: number, 
    updaterType: GameHistoryUpdaterType
  }) {
    const start = moment(g.start).toISOString();
    const timestamp = moment(g.timestamp).toISOString();

    const query = `INSERT INTO GAME_HISTORY (gameId, start, location, status, timestamp, updateType, updaterId, updaterType) VALUES
      ${sqlValues([g.gameId, start, g.location, g.status, timestamp, g.updateType, g.updaterId, g.updaterType])}`;

    const result: InsertQueryResult = await promisifiedQuery(query); assert.ok(result.insertId);
    return result.insertId!;
  }

  //TODO: fails when quotation mark (') is sent
  async editGame(g: {
    id: number;
    start: string | moment.Moment;
    location: string;
    status: GameStatus
    rejectionNote?: string | null
  }) {

    const doesGameExist = !!(await promisifiedQuery(Q_GAME(g.id)));
    assert.ok(doesGameExist, 'Game not found');

    const start = moment(g.start).toISOString();

    const query = `
      UPDATE GAME 
      SET start=${sqlValue(start)},location=${sqlValue(g.location)},
        status=${sqlValue(g.status)},rejectionNote=${sqlValue(g.rejectionNote)}
      WHERE id=${g.id}
    `;

    await promisifiedQuery(query);
  }

  async getArbiterExports() {
    const result: any[] = await promisifiedQuery(Q_ALL_ARBITER_EXPORT);
    return result.map(row => rowToArbiterExport(row));
  }

  async getArbiterExport(id) {
    const result = await promisifiedQuery(Q_ARBITER_EXPORT(id));
    if (!result.length) return null;

    return rowToArbiterExport(result[0]);
  }

  async addArbiterExport(a: {
    timestamp: moment.Moment | string;
    filename: string;
    gameCount: number;
    hasStartEndFilter: boolean;
    hasSchoolIdsFilter: boolean;
    schoolIdsFilter: number[] | null;
    startFilter: moment.Moment | string | null;
    endFilter: moment.Moment | string | null;
    note: string | null
    creatorId: number;
  }) {
    const startFilter = a.hasStartEndFilter
      ? moment(a.startFilter!).toISOString(): null;
    
    const endFilter = a.hasStartEndFilter
      ? moment(a.endFilter!).toISOString(): null;

    const schoolIdsFilter= a.hasSchoolIdsFilter
      ? a.schoolIdsFilter!.join(','): null;

    const timestamp = moment(a.timestamp).toISOString();
    
    const query = `
      INSERT INTO ARBITER_EXPORT (timestamp, filename, gameCount, schoolIdsFilter, startFilter, endFilter, note, creatorId) VALUES
      ${sqlValues([timestamp, a.filename, a.gameCount, schoolIdsFilter, startFilter, endFilter, a.note, a.creatorId])}`;

    const result: InsertQueryResult = await promisifiedQuery(query);
    assert.ok(result.insertId);
    return result.insertId!;
  }

  async editArbiterExport (a: {
    id: number;
    note: string | null;
  }) {

    const exists = !!(await promisifiedQuery(Q_ARBITER_EXPORT(a.id)));
    assert.ok(exists, 'Arbiter export no found');

    const query = `
      UPDATE ARBITER_EXPORT
      SET note=${sqlValue(a.note)}
      WHERE id=${a.id};`;

    await promisifiedQuery(query);
  }

  async addEmailSubscription(o: {
    subscriberId: number;
    subscriptionType: string;
    teamId?: number | null;
    gameId?: number | null;
  }) {
    const query = `
      INSERT INTO EMAIL_SUBSCRIPTION (subscriberId, subscriptionType, teamId, gameId) VALUES
      ${sqlValues([o.subscriberId, o.subscriptionType, o.teamId, o.gameId])}`;

    const result: InsertQueryResult = await promisifiedQuery(query);
    assert.ok(result.insertId);
    return result.insertId!;
  }

  async removeEmailSubscription(subscriptionId) {
    const doesSubscriptionExist = !!(await this.getEmailSubscription(subscriptionId));
    assert.ok(doesSubscriptionExist, 'Subscription not found');

    const query = `DELETE FROM EMAIL_SUBSCRIPTION WHERE id=${subscriptionId}`;

    await promisifiedQuery(query);
  }

  async getEmailSubscriptions() {
    const rows = await promisifiedQuery(Q_EMAIL_SUBSCRIPTIONS);
    return rows.map(rowToEmailSubscription) as EmailSubscription[];
  }

  async getEmailSubscription(subscriptionId: number) {
    const rows = await promisifiedQuery(Q_EMAIL_SUBSCRIPTION(subscriptionId));
    if (!rows.length) return null;

    const row = rows[0];
    return rowToEmailSubscription(row);
  }

  async getEmailSubscriptionsOfSubscriber(subscriberId: number) {
    const rows = await promisifiedQuery(Q_EMAIL_SUBSCRIPTION_OF_SUBSCRIBER(subscriberId));
    return rows.map(rowToEmailSubscription) as EmailSubscription[];
  }
}

function sqlValues(array: Array<string | boolean | null | number | undefined>) { 
  return '(' + array.map(r => sqlValue(r)).join(',') + ')';
}

function sqlValue(v: string | boolean | null | number | undefined) {
  if (typeof v === 'string') return `'${v}'`;
  if (typeof v === 'boolean') return v? '1': '0';
  if (v === null || v === undefined) return 'null';
  return v;
}

function rowToArbiterExport(row: any) {
  return new ArbiterExport({
    id: row.id,
    timestamp: moment(row.timestamp),
    filename: row.filename,
    gameCount: row.gameCount,
    schoolIdsFilter: row.schoolIdsFilter,
    startFilter: row.startFilter? moment(row.startFilter): null,
    endFilter: row.endFilter? moment(row.endFilter): null,
    note: row.note,
    creatorId: row.creatorId
  });
}

function rowToEmailSubscription(row: any) {
  return {
    id: row.id,
    subscriberId: row.subscriberId,
    subscriptionType: row.subscriptionType,
    teamId: row.teamId,
    gameId: row.gameId
  } as EmailSubscription
}

type InsertQueryResult = {
  insertId?: number
};