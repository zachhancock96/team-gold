import { Request, Response } from 'express';
import Game, {GAME_START_FROM_API_FORMAT} from '../game';
import User from '../user';
import Repository from '../repository';
import PrivilegeAccess from '../privilege_access';
import { Privileges as P, GameStatus, Roles, GameAction } from '../enums';
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

const getMyTeams = async (repository: Repository, user: User) => {
  const teams = await repository.getTeams();
  if (user.role === Roles.ASSIGNOR || user.role === Roles.ADMIN) {
    //TODO: assuming one assignor does everything for now
    return teams;
  }

  //school admin or school rep here
  return user.role === Roles.SCHOOL_REP
    ? teams.filter(t => !!t.schoolReps.find(rep => rep.id === user.id))
    : teams.filter(t => t.school.schoolAdmin && t.school.schoolAdmin.id === user.id);
}

const getMyGames = async (repository: Repository, user: User) => {
  if (user.role === Roles.ASSIGNOR || user.role === Roles.ADMIN) {
    //TODO: assuming one assignor does everything for now
    const games = await repository.getGames();
    return games;

  } else {
    //school admin or school rep here

    const games = await repository.getGames();
    const myTeams = await getMyTeams(repository, user);
    const myTeamIds = myTeams.map(t => t.id);

    const myGames = games.filter(g => myTeamIds.indexOf(g.homeTeam.id) >= 0 || 
      myTeamIds.indexOf(g.awayTeam.id) >= 0);

    return myGames;
  }
}

const getGameActions = async (repository: Repository, user: User, gameId: number) => {
  const games = await getMyGames(repository, user);
  const g = games.find(g => g.id === gameId);
  if (!g) {
    return [];
  }

  const { EDIT, REJECT, ACCEPT } = GameAction;

  //rejected, cant do nothing
  if (g.status === GameStatus.REJECTED) {
    return [];
  }

  //assignor and admin may reject/edit a game that has been accepted
  if (g.status.toString() == GameStatus.ACCEPTED.toString()) {
    return (user.role === Roles.ASSIGNOR || user.role === Roles.ADMIN)
      ? [EDIT, REJECT]
      : [];
  }

  //game status pending from here
  
  if (user.role === Roles.ASSIGNOR || user.role === Roles.ADMIN) {
    return [EDIT, REJECT, ACCEPT];
  }

  //only reps and school admins from here

  if (g.status === GameStatus.PENDING_ASSIGNOR) {
    return [];
  }

  const myTeams = await getMyTeams(repository, user);
  const myTeamIds = myTeams.map(t => t.id);

  const doesRepresentHome = myTeamIds.indexOf(g.homeTeam.id) >= 0;

  if (doesRepresentHome) {
    if (g.status === GameStatus.PENDING_HOME_TEAM) {
      return [EDIT, REJECT, ACCEPT];
    } else {
      return [EDIT, REJECT];
    }
  } else {
    //user represents away team

    if (g.status === GameStatus.PENDING_AWAY_TEAM) {
      return [EDIT, REJECT, ACCEPT];
    } else {
      return [EDIT, REJECT]; 
    }
  }
}

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

  getMyGames = async (req: Request, res: Response) => {
    const user = req.user!;
    const games = await getMyGames(this.repository, user);
    res.send({ ok: true, games: games.map(g => g.toApi()) });
  }

  getGameActions = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const user = req.user!;

    const actions = await getGameActions(this.repository, user, id);
    res.send({ ok: true, actions });
  }

  acceptGame = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const user = req.user!;

    const actions = await getGameActions(this.repository, user, id);
    const canAccept = actions.indexOf(GameAction.ACCEPT) >= 0;

    if (!canAccept) {
      return res.send({ok: false, reason: 'Cannot accept the game'});
    }

    const game = await (async () => {
      const games = await this.repository.getGames();
      return games.find(g => g.id === id);
    })();

    const status = user.role === Roles.ASSIGNOR || user.role === Roles.ADMIN
      ? GameStatus.ACCEPTED
      : GameStatus.PENDING_ASSIGNOR;

    await this.repository.editGame({
      id: game!.id,
      start: game!.start,
      location: game!.location,
      status
    });

    await this.repository.addGameHistory({
      gameId: game!.id,
      start: game!.start,
      location: game!.location,
      status,
      timestamp: moment(),
      updateType: 'accept',
      updaterType: 'assignor',//TODO: change this later
      updaterId: user.id
    });

    res.send({ ok: true})
  }

  rejectGame = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const user = req.user!;

    const actions = await getGameActions(this.repository, user, id);
    const canReject = actions.indexOf(GameAction.REJECT) >= 0;

    if (!canReject) {
      return res.send({ok: false, reason: 'Cannot reject the game'});
    }

    const game = await (async () => {
      const games = await this.repository.getGames();
      return games.find(g => g.id === id);
    })();

    const status = GameStatus.REJECTED;

    await this.repository.editGame({
      id: game!.id,
      start: game!.start,
      location: game!.location,
      status
    });

    await this.repository.addGameHistory({
      gameId: game!.id,
      start: game!.start,
      location: game!.location,
      status,
      timestamp: moment(),
      updateType: 'reject',
      updaterType: 'assignor',//TODO: change this later
      updaterId: user.id
    });

    res.send({ ok: true})
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

    const isMyTeam = async team => {
      const myTeams = await getMyTeams(repo, user);
      return !!myTeams.find(t => t.id === team.id);
    }

    const hasPrivilegeOverHome = await isMyTeam(homeTeam);
    const hasPrivilegeOverAway = await isMyTeam(awayTeam);

    if (!hasPrivilegeOverHome && !hasPrivilegeOverAway) {
      res.send({ok: false, reason: 'Has no privelege over either home or away team'});
    }

    if (homeTeam.teamKind !== awayTeam.teamKind) {
      res.send({ok: false, reason: 'Game should be matched between  same kind of team'});
    }

    //TODO: there may still be conflict in time/location

    const status = user.role === Roles.ASSIGNOR || Roles.ADMIN
      ? GameStatus.ACCEPTED
      : hasPrivilegeOverHome
      ? GameStatus.PENDING_AWAY_TEAM
      : GameStatus.PENDING_HOME_TEAM;

    const insertedId = await repo.addGame({
      homeTeamId: body.homeTeamId,
      awayTeamId: body.awayTeamId,
      start: body.start,
      location: body.location,
      status
    });

    await repo.addGameHistory({
      gameId: insertedId,
      start: body.start,
      location: body.location,
      status,
      timestamp: moment(),
      updateType: 'create',
      updaterType: 'assignor',//TODO: change this later
      updaterId: user.id
    });

    res.send({ok: true, gameId: insertedId});
  }

  getGameHistory = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const history = await this.repository.getGameHistory(id);
    res.send({ok: true, history: history})
  }
}

  // editGame = async (req: Request, res: Response) => {
  //   const repo = this.repository;

  //   const gameId = parseInt(req.params.id);
  //   const body = req.body as ApiSchema.Game_EDIT;

  //   const isValidStart = moment(body.start, GAME_START_FROM_API_FORMAT, true).isValid();
  //   if (!isValidStart) {
  //     res.send({ok: false, reason: 'bad start format'});
  //     return;
  //   }
  //   if (!body.location) {
  //     res.send({ok: false, reason: 'bad location'});
  //     return;
  //   }

  //   const games = await this.repository.getGames();
  //   const game = games.find(g => g.id === gameId) || null;
  //   if (!game) {
  //     res.send({ok: false, reason: 'Game not found'});
  //     return;
  //   }

  //   if (game.status === GameStatus.REJECTED) {
  //     res.send({ok: false, reason: 'Game was rejected'});
  //     return;
  //   }
  //   if (game.status === GameStatus.APPROVED_LOCKED) {
  //     res.send({ok: false, reason: 'No further changes are allowed in this game.'});
  //     return;
  //   }

  //   const user = req.user!;

  //   const hasUserPrivilegeOverGame = await this.privilegeAccess.hasGamePrivilege(user, game, [P.GamePrivilege.UPDATE_GAME]);
  //   if (!hasUserPrivilegeOverGame) {
  //     return res.send({ok: false, reason: 'Not enough privilege.'});
  //   }

  //   //TODO: how will status change when game is edited by admin/assignor
  //   //for now there is no change
  //   if (user.role === Roles.ADMIN || user.role === Roles.ASSIGNOR) {
  //     await repo.editGame({
  //       id: gameId,
  //       start: body.start,
  //       location: body.location,
  //       status: game.status
  //     });
      
  //     return res.send({ok: true});
  //   }

  //   const isEditedByHomeTeam = (function() {
  //     const schoolAdmin = game.homeTeam.school.schoolAdmin;
  //     const reps = game.homeTeam.school.schoolReps;

  //     const isRep = !!reps.find(rep => rep.equals(user));
  //     const isSchoolAdmin = schoolAdmin && schoolAdmin.equals(user);

  //     return isRep || isSchoolAdmin;
  //   })();
    
  //   await repo.editGame({
  //     id: gameId,
  //     start: body.start,
  //     location: body.location,
  //     status: isEditedByHomeTeam
  //       ? GameStatus.PENDING_AWAY_TEAM
  //       : GameStatus.PENDING_HOME_TEAM
  //   });

  //   res.send({ok: true});
  // }