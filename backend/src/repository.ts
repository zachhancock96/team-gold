import mysql from 'mysql';
import moment, { DATETIME_TO_API_FORMAT } from './moment';
import User from './user';
import School from './school';
import Team from './team';
import District from './district';
import Game from './game';
import { GameStatus } from './enums';
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
const Q_ALL_SCHOOL_REP = 'SELECT * FROM SCHOOL_REP;';
const Q_ALL_SCHOOL_REP_TEAM_ASSN = 'SELECT * FROM SCHOOL_REP_TEAM_ASSN;';
const Q_ALL_GAME = 'SELECT * FROM GAME;';
const Q_GAME = (gameId: number) => `SELECT * FROM GAME WHERE id=${gameId};`;
const Q_GAME_HISTORY_OF_GAME = (gameId: number) => `SELECT * FROM GAME_HISTORY WHERE gameId=${gameId} ORDER BY timestamp DESC;`;

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
    const schoolRepsR = await promisifiedQuery(Q_ALL_SCHOOL_REP);
    const schoolRepTeamAssnsR = await promisifiedQuery(Q_ALL_SCHOOL_REP_TEAM_ASSN);

    //1 init users
    const users: User[] = usersR.map(row => new User({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role
    }));

    //2.a init district
    const districts: District[] = districtsR.map(row => new District({
      id: row.id,
      name: row.name
    }));

    //2.b assignors to district
    districtsR.forEach(row => {
      const assignorId: number | null = row.assignorId;
      if (assignorId) {
        const assignor = users.find(u => u.id === assignorId) || null;
        const district = districts.find(d => d.id === row.id);
        district!.assignor = assignor;
      }
    });

    //3.a init schools
    const schools: School[] = schoolsR.map(row => new School({
      id: row.id,
      name: row.name
    }));

    //2.c schools to district
    //3.b district to school
    {
      const districtToSchoolMap: { [districtId: number]: School[]} = {};
      
      schoolsR.forEach((schoolRow, i) => {
        const distId = schoolRow.districtId;
        districtToSchoolMap[distId] = districtToSchoolMap[distId] || [];
        districtToSchoolMap[distId].push(schools[i]);
      });
  
      Object.keys(districtToSchoolMap).forEach(k => {
        const districtId = Number(k);
        const district = districts.find(d => d.id === districtId);
        const schools = districtToSchoolMap[k];
        district!.schools = schools;
      });
    }

    //3.c school reps to school
    {
      const schoolToSchoolRepMap: { [schoolId: number]: User[] } = {};

      schoolRepsR.forEach(repRow => {
        const schoolRepId: number = repRow.userId;
        const schoolId: number = repRow.schoolId;
        
        const rep = users.find(u => u.id === schoolRepId);
        schoolToSchoolRepMap[schoolId] = schoolToSchoolRepMap[schoolId] || [];
        schoolToSchoolRepMap[schoolId].push(rep!);        
      });

      Object.keys(schoolToSchoolRepMap).forEach(k => {
        const schoolId = Number(k);
        const school = schools.find(s => s.id === schoolId);
        const schoolReps = schoolToSchoolRepMap[schoolId];
        school!.schoolReps = schoolReps;
      });
    }

    //3.d school admin to school
    {
      schoolsR.forEach(row => {
        const schoolAdminId: number | null = row.schoolAdminId;
        if (schoolAdminId) {
          const schoolAdmin = users.find(u => u.id === schoolAdminId) || null;
          const school = schools.find(s => s.id === row.id);
          school!.schoolAdmin = schoolAdmin;
        }
      })
    }

    //4.a init teams
    const teams: Team[] = teamsR.map(row => new Team({
      id: row.id,
      name: row.name,
      teamKind: row.teamKind
    }));

    //4.b schoolReps to team
    {
      const teamToSchoolRepMap: { [teamId: number]: User[] } = {};
      
      schoolRepTeamAssnsR.forEach(assnRow => {
        const teamId: number = assnRow.teamId;
        const schoolRepId: number = (function() {
          //this points to column in schoolRep table
          const schoolRepId: number = assnRow.schoolRepId;

          //returning userId field of that row
          return schoolRepsR.find(r => r.id === schoolRepId).userId;
        })();

        const schoolRep = users.find(u => u.id === schoolRepId);
        teamToSchoolRepMap[teamId] = teamToSchoolRepMap[teamId] || [];
        teamToSchoolRepMap[teamId].push(schoolRep!);
      });

      Object.keys(teamToSchoolRepMap).forEach(k => {
        const teamId = Number(k);
        const team = teams.find(t => t.id === teamId);
        team!.schoolReps = teamToSchoolRepMap[teamId];
      })
    }

    //3.d teams to school
    //4.c school to team
    {
      const schoolToTeamMap: { [schoolId: number]: Team[] } = {};

      teamsR.forEach(teamRow => {
        const teamId: number = teamRow.id;
        const schoolId: number = teamRow.schoolId;

        const team = teams.find(t => t.id === teamId);
        schoolToTeamMap[schoolId] = schoolToTeamMap[schoolId] || [];
        schoolToTeamMap[schoolId].push(team!);
      });

      Object.keys(schoolToTeamMap).forEach(k => {
        const schoolId = Number(k);
        const school = schools.find(s => s.id === schoolId);
        school!.teams = schoolToTeamMap[schoolId];
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

  async addGame(g: {
    homeTeamId: number;
    awayTeamId: number;
    start: string | moment.Moment;
    location: string;
    status: GameStatus;
  }) {
    const start = moment(g.start).toISOString();

    const query = `
      INSERT INTO GAME (homeTeamId, awayTeamId, start, location, status, rejectionNote) VALUES
      ${sqlValues([g.homeTeamId, g.awayTeamId, start, g.location, g.status, null])}
    `;

    const result: InsertQueryResult  = await promisifiedQuery(query);
    assert.ok(result.insertId);
    return result.insertId!;
  }

  async editGame(g: {
    id: number;
    start: string | moment.Moment;
    location: string;
    status: GameStatus
    rejectionNote?: string | null
  }) {

    const doesGameExist = !!(await promisifiedQuery(`SELECT * FROM GAME WHERE id=${g.id}`));
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
}

function sqlValues(array: Array<string | null | number | undefined>) { 
  return '(' + array.map(r => sqlValue(r)).join(',') + ')';
}

function sqlValue(v: string | null | number | undefined) {
  if (typeof v === 'string') return `'${v}'`;
  if (v === null || v === undefined) return 'null';
  return v;
}

type InsertQueryResult = {
  insertId?: number
};