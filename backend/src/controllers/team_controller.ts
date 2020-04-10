import { Request, Response } from 'express';
import Repository from '../repository';
import PrivilegeAccess from '../privilege_access';
import { Privileges as P,  Roles } from '../enums';
import Team from '../team';

export default class TeamController {
  private repository: Repository;
  private privilegeAccess: PrivilegeAccess;

  constructor(repository: Repository, privilegeAccess: PrivilegeAccess) {
    this.repository = repository;
    this.privilegeAccess = privilegeAccess;
  }

  getTeams = async (req: Request, res: Response) => {
    const teams_ = await this.repository.getTeams();
    let teams;
    if (req.query.schoolAdmin) {
      const schoolAdminId = parseInt(req.query.schoolAdmin);
      teams = teams_.filter(t => t.school.schoolAdmin && t.school.schoolAdmin.id === schoolAdminId);
    }
    if (req.query.schoolRep) {
      const schoolRepId = parseInt(req.query.schoolRep);
      teams = teams_.filter(t => t.schoolReps.find(rep => rep.id === schoolRepId));
    }
    if (req.query.assignor) {
      const assignorId = parseInt(req.query.assignor);
      teams = teams_.filter(t => t.school.district && t.school.district.assignor && t.school.district.assignor.id === assignorId);
    }
    teams = teams || teams_;
    res.send({ok: true, teams: teams.map(s => s.toApi())});
  }

  getTeam = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const teams = await this.repository.getTeams();
    const team = teams.find(t => t.id === id);
    res.send({ok: true, team: team? team.toApi(): null});
  }

  getTeamsWithPrivilegesForUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const users = await this.repository.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      res.send({ok: false, reason: 'User not found'});
      return;
    }
    const rawPrivileges = req.params.privileges.split(';');
    
    //null if invalid
    //invalid if unrecognized privilege value or duplicate privilege values
    const privileges = rawPrivileges.reduce((privileges: P.TeamPrivilege[] | null, rawPrivilege) => {
      if (privileges == null) return null;

      //bad value
      if (!isTeamPrivilege(rawPrivilege)) return null;
      
      const privilege = rawPrivilege as P.TeamPrivilege;

      //dup entry
      if (privileges.indexOf(privilege) >= 0) return null;

      privileges.push(privilege);
      return privileges;
    }, []);

    if (!privileges || !privileges.length) {
      res.send({ok: false, reason: 'Bad privilege parameter'});
      return;
    }
    
    const teams = await this.privilegeAccess.getTeamsWithPrivilege(user, privileges);
    res.send({ok: true, teams: teams.map(g => g.toApi())});
  }
}

function isTeamPrivilege(s: string) {
  return s &&
    s === P.TeamPrivilege.MANAGE_GAME;
}