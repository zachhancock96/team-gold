import { Request, Response } from 'express';
import Game, {GAME_START_FROM_API_FORMAT} from '../game';
import Repository from '../repository';
import PrivilegeAccess from '../privilege_access';
import { Privileges as P, GameStatus, Roles } from '../enums';
import moment from '../moment';

/*

  TODO: emit event upon certain events e.g. when game gets added
  the type definitions may be provided in global namespace like:
  namespace APP_EVENTS {
    interface GAME_EVENT {
      gameId: number,
      type: GAME_ADDED | GAME_APPROVED | GAME_REJECTED etc
    }
  }

*/
export default class GameController {

  private repository: Repository;
  private privilegeAccess: PrivilegeAccess;

  constructor(repository: Repository, privilegeAccess: PrivilegeAccess) {
    this.repository = repository;
    this.privilegeAccess = privilegeAccess;
  }

  getAllGames = async (req: Request, res: Response) => {
    const games = await this.repository.getGames();
    res.send({ok: true, games: games.map(g => g.toApi())});
  }

  getGame = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const games = await this.repository.getGames();
    const game = games.find(g => g.id === id) || null;
    res.send({ok: true, game: game? game.toApi(): null });
  }

  getGamesWithPrivilegesForUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const users = await this.repository.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      res.send({ok: false, reason: 'User not found'});
      return;
    }
    const rawPrivileges = req.params.privileges.split(';');
    console.log(rawPrivileges);
    
    //null if invalid
    //invalid if unrecognized privilege value or duplicate privilege values
    const privileges = rawPrivileges.reduce((privileges: P.GamePrivilege[] | null, rawPrivilege) => {
      if (privileges == null) return null;

      //bad value
      if (!isGamePrivilege(rawPrivilege)) return null;
      
      const privilege = rawPrivilege as P.GamePrivilege;

      //dup entry
      if (privileges.indexOf(privilege) >= 0) return null;

      privileges.push(privilege);
      return privileges;
    }, []);

    if (!privileges || !privileges.length) {
      res.send({ok: false, reason: 'Bad privilege parameter'});
      return;
    }
    
    const games = await this.privilegeAccess.getGamesWithPrivilege(user, privileges);
    res.send({ok: true, games: games.map(g => g.toApi())});
  }

  addGame = async (req: Request, res: Response) => {
    const repo = this.repository;
    const body = req.body as ApiSchema.Game_ADD;

    if (!body.homeTeamId || !body.awayTeamId || !body.location || !body.start) {
      res.send({ok: false, reason: 'bad request'});
      return;
    }
    
    //TODO: only date format is being checked
    //if the value is something ridiculuous like 50 years into the
    //future, what to do in that case.
    const isValidFormat = moment(body.start, GAME_START_FROM_API_FORMAT, true).isValid();
    if (!isValidFormat) {
      res.send({ok: false, reason: 'bad start format'});
      return;
    }

    const user = req.user!;

    const [homeTeam, awayTeam] = await (async () => {
      const teams = await repo.getTeams();
      const homeTeam = teams.find(t => t.id === body.homeTeamId);
      const awayTeam = teams.find(t => t.id === body.awayTeamId);
      
      return [homeTeam, awayTeam];
    })();

    if (!homeTeam) {
      res.send({ok: false, reason: 'home team not found'});
      return;
    }
    if (!awayTeam) {
      res.send({ok: false, reason: 'away team not found'});
      return;
    }

    const hasPrivilegeOverHome = await this.privilegeAccess.hasTeamPrivilege(user, homeTeam, [P.TeamPrivilege.MANAGE_GAME]);
    const hasPrivilegeOverAway = await this.privilegeAccess.hasTeamPrivilege(user, awayTeam, [P.TeamPrivilege.MANAGE_GAME]);

    if (!hasPrivilegeOverHome && !hasPrivilegeOverAway) {
      res.send({ok: false, reason: 'Has no privelege over either home or away team'});
    }

    if (homeTeam.teamKind !== awayTeam.teamKind) {
      res.send({ok: false, reason: 'Game should be matched between  same kind of team'});
    }

    //TODO: sometime user may privilege over both home and away team
    //if the user were assignor or admin. What should be the status in that case

    //TODO: there may still be conflict in time/location

    const insertedId = await repo.addGame({
      homeTeamId: body.homeTeamId,
      awayTeamId: body.awayTeamId,
      start: body.start,
      location: body.location,
      status: hasPrivilegeOverHome
        ? GameStatus.PENDING_AWAY_TEAM
        : GameStatus.PENDING_HOME_TEAM
    });

    res.send({ok: true, gameId: insertedId});
  }

  editGame = async (req: Request, res: Response) => {
    const repo = this.repository;

    const gameId = parseInt(req.params.id);
    const body = req.body as ApiSchema.Game_EDIT;

    const isValidStart = moment(body.start, GAME_START_FROM_API_FORMAT, true).isValid();
    if (!isValidStart) {
      res.send({ok: false, reason: 'bad start format'});
      return;
    }
    if (!body.location) {
      res.send({ok: false, reason: 'bad location'});
      return;
    }

    const games = await this.repository.getGames();
    const game = games.find(g => g.id === gameId) || null;
    if (!game) {
      res.send({ok: false, reason: 'Game not found'});
      return;
    }

    if (game.status === GameStatus.REJECTED) {
      res.send({ok: false, reason: 'Game was rejected'});
      return;
    }
    if (game.status === GameStatus.APPROVED_LOCKED) {
      res.send({ok: false, reason: 'No further changes are allowed in this game.'});
      return;
    }

    const user = req.user!;

    const hasUserPrivilegeOverGame = await this.privilegeAccess.hasGamePrivilege(user, game, [P.GamePrivilege.UPDATE_GAME]);
    if (!hasUserPrivilegeOverGame) {
      return res.send({ok: false, reason: 'Not enough privilege.'});
    }

    //TODO: how will status change when game is edited by admin/assignor
    //for now there is no change
    if (user.role === Roles.ADMIN || user.role === Roles.ASSIGNOR) {
      await repo.editGame({
        id: gameId,
        start: body.start,
        location: body.location,
        status: game.status
      });
      
      return res.send({ok: true});
    }

    const isEditedByHomeTeam = (function() {
      const schoolAdmin = game.homeTeam.school.schoolAdmin;
      const reps = game.homeTeam.school.schoolReps;

      const isRep = !!reps.find(rep => rep.equals(user));
      const isSchoolAdmin = schoolAdmin && schoolAdmin.equals(user);

      return isRep || isSchoolAdmin;
    })();
    
    await repo.editGame({
      id: gameId,
      start: body.start,
      location: body.location,
      status: isEditedByHomeTeam
        ? GameStatus.PENDING_AWAY_TEAM
        : GameStatus.PENDING_HOME_TEAM
    });

    res.send({ok: true});
  }

  acceptGame = async (req: Request, res: Response) => {
    const repo = this.repository;
    const gameId = parseInt(req.params.id);
    const user = req.user!; 

    if (user.role !== Roles.SCHOOL_ADMIN && user.role !== Roles.SCHOOL_REP) {
      return res.send({ok: false, reason: 'Operation permitted to only school admins and school reps'});
    }

    const games = await repo.getGames();
    const game = games.find(g => g.id === gameId) || null;

    if (!game) {
      return res.send({ok: false, reason: 'Game not found'});
    }

    if (game.status !== GameStatus.PENDING_AWAY_TEAM && game.status !== GameStatus.PENDING_HOME_TEAM) {
      return res.send({ok: false, reason: `Current game status is: ${game.status}`})
    }
        
    const hasPrivilege = await this.privilegeAccess.hasTeamPrivilege(user, 
      GameStatus.PENDING_HOME_TEAM? game.homeTeam: game.awayTeam, 
      [P.TeamPrivilege.MANAGE_GAME]);
    
    if (!hasPrivilege) {
      return res.send({ok: false, reason: 'Not enough privilege'});
    }

    await repo.editGame({
      id: game.id,
      start: game.start,
      location: game.location,
      status: GameStatus.PENDING_ASSIGNOR
    });

    res.send({ok: true});
  }

  rejectGame = async (req: Request, res: Response) => {
    const repo = this.repository;
    const gameId = parseInt(req.params.id);
    const user = req.user!;
    const rejectionNote = (req.body as ApiSchema.Game_REJECT).rejectionNote || null;
    
    const games = await this.repository.getGames();
    const game = games.find(g => g.id === gameId) || null;
    if (!game) {
      return res.send({ok: false, reason: 'Game not found'});
    }

    if (game.status === GameStatus.REJECTED || 
        game.status === GameStatus.APPROVED_LOCKED) {
      return res.send({ok: false, reason: `Current game status is: ${game.status}`});
    }

    //NOTE: any one with update privilege is able to reject game
    const hasPrivilegeOverGame = await this.privilegeAccess.hasGamePrivilege(user, game, [P.GamePrivilege.UPDATE_GAME]);
    if (!hasPrivilegeOverGame) {
      return res.send({ok: false, reason: 'Not enough privilege'});
    }

    await repo.editGame({
      id: game.id,
      start: game.start,
      location: game.location,
      status: GameStatus.REJECTED,
      rejectionNote
    });

    res.send({ok: true});
  }

  approveGame = async (req: Request, res: Response) => {
    const repo = this.repository;
    const gameId = parseInt(req.params.id);
    const user = req.user!;

    const games = await this.repository.getGames();
    const game = games.find(g => g.id === gameId) || null;
    if (!game) {
      return res.send({ok: false, reason: 'Game not found'});
    }

    //NOTE: only games with pending_assignor status could be approved by assignor
    if (game.status !== GameStatus.PENDING_ASSIGNOR) {
      return res.send({ok: false, reason: `Current game status is: ${game.status}`});
    }

    const hasApprovePrivilege = await this.privilegeAccess.hasGamePrivilege(user, game, [P.GamePrivilege.APPROVE_GAME]);
    if (!hasApprovePrivilege) {
      return res.send({ok: false, reason: 'Not enough privilege'});
    }

    await repo.editGame({
      id: game.id,
      start: game.start,
      location: game.location,
      status: GameStatus.APPROVED_UNLOCKED
    });

    res.send({ok: true});
  }
}

function isGamePrivilege(s: string) {
  return s &&
    (s === P.GamePrivilege.APPROVE_GAME
      || s === P.GamePrivilege.UPDATE_GAME);
}