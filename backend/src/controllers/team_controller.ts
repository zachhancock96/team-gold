import { Request, Response } from 'express';
import Repository from '../repository';
import { Privileges as P,  Roles } from '../enums';
import Team from '../team';
import User from '../user';

//TODO: this logic is duplicated in game_controller.ts
const getMyTeams = async (repo: Repository, user: User) => {
  const teams = await repo.getTeams();
  if (user.role === Roles.ASSIGNOR || user.role === Roles.ADMIN) {
    //TODO: assuming one assignor does everything for now
    return teams;
  }

  //school admin or school rep here
  return user.role === Roles.SCHOOL_REP
    ? teams.filter(t => !!t.schoolReps.find(rep => rep.id === user.id))
    : teams.filter(t => t.school.schoolAdmin && t.school.schoolAdmin.id === user.id);
}

export default class TeamController {
  private repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  getTeams = async (req: Request, res: Response) => {
    const teams = await this.repository.getTeams();
    res.send({ok: true, teams: teams.map(s => s.toApi())});
  }

  getTeam = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const teams = await this.repository.getTeams();
    const team = teams.find(t => t.id === id);
    res.send({ok: true, team: team? team.toApi(): null});
  }

  getMyTeams = async (req: Request, res: Response) => {
    const user = req.user!;
    const teams = await getMyTeams(this.repository, user);
    res.send({ok: true, teams: teams.map(s => s.toApi())});
  }
}