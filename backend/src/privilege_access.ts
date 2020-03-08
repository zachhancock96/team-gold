import { Privileges as P, Roles } from './enums';
import Repository from './repository';
import Game from './game';
import Team from './team';
import School from './school';
import User from './user';
import District from './district';
import * as assert from 'assert';

//TODO: assert that privilege arrays have atleast one element
//and dont have any repeats

export default class PrivilegeAccess {
  private repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  async getTeamsWithPrivilege(user: User, privileges: P.TeamPrivilege[]) {
    //team privilege is just MANAGE_GAME
    const repo = this.repository;

    if (user.role === Roles.ADMIN) {

      return repo.getTeams();
    }
    else if (user.role === Roles.ASSIGNOR) {

      let districts = await repo.getDistricts();
      districts = districts.filter(d => d.assignor && d.assignor.equals(user))

      const teams = districts
        .reduce((schools: School[], district) => {
          district.schools.forEach(school => { schools.push(school); })
          return schools;
        }, [])
        .reduce((teams: Team[], school) => {
          school.teams.forEach(team => teams.push(team));
          return teams;
        }, []);

      return teams;
    } else if (user.role === Roles.SCHOOL_ADMIN) {

      const schools = await repo.getSchools();
      const school = schools.find(school => school.schoolAdmin && school.schoolAdmin.equals(user));
      return school
        ? school.teams
        : [];
    } else if (user.role === Roles.SCHOOL_REP) {

      const teams = await repo.getTeams();
      return teams.filter(t => !!t.schoolReps.find(rep => rep.equals(user)));
    }

    //this wont get called
    return [];
  }

  async getGamesWithPrivilege(user: User, privileges: P.GamePrivilege[]) {
    //approve_game privilege includes update_game privilege
    const privilege = privileges.indexOf(P.GamePrivilege.APPROVE_GAME) > 0
      ? P.GamePrivilege.APPROVE_GAME
      : P.GamePrivilege.UPDATE_GAME;

    const role = user.role;

    if (privilege === P.GamePrivilege.APPROVE_GAME &&
        (user.role === Roles.SCHOOL_ADMIN || role === Roles.SCHOOL_REP)) {

      return [];
    }

    const games = await this.repository.getGames();
    const teams = await this.getTeamsWithPrivilege(user, [P.TeamPrivilege.MANAGE_GAME]);

    const returnSet: Set<Game> = new Set();
    teams.forEach(t => {
      games.forEach(g => {
        if (g.awayTeam.equals(t) || g.homeTeam.equals(t)) {
          returnSet.add(g);
        }
      });
    });

    return Array.from(returnSet);
  }

  async getSchoolsWithPrivilege(user: User, privileges: P.SchoolPrivilege[]) {
    let schools = await this.repository.getSchools();
    
    if (user.role === Roles.ADMIN) {

      return schools;
    } else if (user.role === Roles.ASSIGNOR) {

      return schools.filter(s => s.district && s.district.assignor && s.district.assignor.equals(user));
    } else if (user.role === Roles.SCHOOL_ADMIN) {

      return schools.filter(s => s.schoolAdmin && s.schoolAdmin.equals(user));
    } else if (user.role === Roles.SCHOOL_REP) {

      if (privileges.indexOf(P.SchoolPrivilege.MANAGE_TEAM) >= 0 ||
        privileges.indexOf(P.SchoolPrivilege.MANAGE_SCHOOL_REP) >= 0) {
          return [];
        }

      return schools
        .filter(s => !!s.schoolReps.find(rep => rep.equals(user)));
    }

    //this wont get called
    return [];
  }

  async hasGamePrivilege(user: User, game: Game, privileges: P.GamePrivilege[]) {
    const games = await this.getGamesWithPrivilege(user, privileges);
    return !!games.find(g => g.equals(game));
  }
 
  async hasTeamPrivilege(user: User, team: Team, privileges: P.TeamPrivilege[]) {
    const teams = await this.getTeamsWithPrivilege(user, privileges);
    return !!teams.find(t => t.equals(team));
  }

  async hasSchoolPrivilege(user: User, school: School, privileges: P.SchoolPrivilege[]) {
    const schools = await this.getSchoolsWithPrivilege(user, privileges);
    return !!schools.find(s => s.equals(school));
  }
}