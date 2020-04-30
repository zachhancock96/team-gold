import { Request, Response } from 'express';
import Game from '../game';
import User from '../user';
import Team from '../team';
import Repository from '../repository';
import { GameStatus, Roles, GameAction } from '../enums';
import moment, { DATETIME_FROM_API_FORMAT } from '../moment';
import { Subject, Observable } from 'rxjs';

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

const BUFFER = 120;

const getUpdaterType = async (repo: Repository, user: User, game: Game) => {
  const hasPrivilegeOverHome = await isMyTeam(repo, user, game.homeTeam);

  return user.role === Roles.ASSIGNOR
    ? 'assignor'
    : user.role === Roles.ADMIN
    ? 'admin'
    : hasPrivilegeOverHome
    ? 'home'
    : 'away';
}

const isMyTeam = async (repo: Repository, user: User, team: Team) => {
  const myTeams = await getMyTeams(repo, user);
  return !!myTeams.find(t => t.id === team.id);
}

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
    //this covers NON-LHSAA games too
    return [EDIT, REJECT];
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
  private _gameUpdate$: Subject<number>;
  private _gameEdit$: Subject<{oldGame: Game, historyId: number}>;
  
  constructor(repository: Repository) {
    this.repository = repository;
    this._gameUpdate$ = new Subject();
    this._gameEdit$ = new Subject();
  }

  get gameUpdate$(): Observable<number> {
    return this._gameUpdate$;
  }

  get gameEdit$(): Observable<{oldGame: Game, historyId: number}> {
    return this._gameEdit$;
  }

  getAllGames = async (req: Request, res: Response) => {
    const games = await this.repository.getGames();
    res.send({ok: true, games: games.map(g => g.toApi())});
  }

  getGame = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const game = await this.repository.getGame(id);
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

    const game = await this.repository.getGame(id);

    const status = user.role === Roles.ASSIGNOR || user.role === Roles.ADMIN
      ? GameStatus.ACCEPTED
      : GameStatus.PENDING_ASSIGNOR;
    
    const updaterType = await getUpdaterType(this.repository, user, game!);

    await this.repository.editGame({
      id: game!.id,
      start: game!.start,
      location: game!.location,
      status
    });

    const historyId = await this.repository.addGameHistory({
      gameId: game!.id,
      start: game!.start,
      location: game!.location,
      status,
      timestamp: moment(),
      updateType: 'accept',
      updaterType: updaterType,//TODO: change this later
      updaterId: user.id
    });

    res.send({ ok: true});

    this._gameUpdate$.next(historyId);
  }

  rejectGame = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const user = req.user!;

    const actions = await getGameActions(this.repository, user, id);
    const canReject = actions.indexOf(GameAction.REJECT) >= 0;

    if (!canReject) {
      return res.send({ok: false, reason: 'Cannot reject the game'});
    }

    const game = await this.repository.getGame(id);

    const status = GameStatus.REJECTED;

    const updaterType = await getUpdaterType(this.repository, user, game!);

    await this.repository.editGame({
      id: game!.id,
      start: game!.start,
      location: game!.location,
      status
    });

    const historyId = await this.repository.addGameHistory({
      gameId: game!.id,
      start: game!.start,
      location: game!.location,
      status,
      timestamp: moment(),
      updateType: 'reject',
      updaterType,
      updaterId: user.id
    });

    res.send({ ok: true});

    this._gameUpdate$.next(historyId);
  }

  _checkConflict = async (homeTeamId: number, awayTeamId: number, start: string | moment.Moment) => {
    const repo = this.repository;
    let games  = await repo.getGames();

    const fn = (g: Game) => g.homeTeam.id === homeTeamId || g.homeTeam.id === awayTeamId
      || g.awayTeam.id === homeTeamId || g.awayTeam.id === awayTeamId;
    
    games = games
      .filter(fn)
      .filter(g => g.status !== 'rejected');

    const left = moment(start).add(-BUFFER, 'minutes');
    const right = moment(start).add(BUFFER, 'minutes');
    
    const error = games.reduce((error: string | null, g: Game) => {
      if (error) return error;
      
      const doesOverlap = left.isBefore(g.start) && right.isAfter(g.start);

      if (doesOverlap) return `There is a conflict in schedule with the game, ${g.homeTeam.name} vs ${g.awayTeam.name}
        ,scheduled at ${g.prettyStart}`;

      return null;
    }, null);

    return error;
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
    const isValidFormat = moment(body.start, DATETIME_FROM_API_FORMAT, true).isValid();
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
    if (!homeTeam.isLhsaa) {
      res.send({ok: false, reason: 'home team must be LHSAA member as recognized by the system'});
      return;
    }
    if (!awayTeam) {
      res.send({ok: false, reason: 'away team not found'});
      return;
    }

    const hasPrivilegeOverHome = await isMyTeam(repo, user, homeTeam);
    const hasPrivilegeOverAway = await isMyTeam(repo, user, awayTeam);

    if (!hasPrivilegeOverHome && !hasPrivilegeOverAway) {
      res.send({ok: false, reason: 'Has no privelege over either home or away team'});
      return;
    }

    if (homeTeam.teamKind !== awayTeam.teamKind) {
      res.send({ok: false, reason: 'Game should be matched between  same kind of team'});
      return;
    }

    const status = user.role === Roles.ASSIGNOR || user.role === Roles.ADMIN
      ? GameStatus.ACCEPTED
      : !awayTeam.isLhsaa
      ? GameStatus.PENDING_ASSIGNOR
      : hasPrivilegeOverHome
      ? GameStatus.PENDING_AWAY_TEAM
      : GameStatus.PENDING_HOME_TEAM;

    const message = await this._checkConflict(homeTeam.id, awayTeam.id, body.start);
    if (message) {
      res.send({ok: false, reason: message});
      return;
    }

    const insertedId = await repo.addGame({
      homeTeamId: body.homeTeamId,
      awayTeamId: body.awayTeamId,
      start: body.start,
      location: body.location,
      status
    });

    const game = await this.repository.getGame(insertedId);
    const updaterType = await getUpdaterType(repo, user, game!);

    const historyId = await repo.addGameHistory({
      gameId: insertedId,
      start: body.start,
      location: body.location,
      status,
      timestamp: moment(),
      updateType: 'create',
      updaterType,
      updaterId: user.id
    });

    res.send({ok: true, gameId: insertedId});

    this._gameUpdate$.next(historyId);
  }

  editGame = async (req: Request, res: Response) => {
    const repo = this.repository;
    const user = req.user!;

    const gameId = parseInt(req.params.id);
    const body = req.body as ApiSchema.Game_EDIT;

    const isValidStart = moment(body.start, DATETIME_FROM_API_FORMAT, true).isValid();
    if (!isValidStart) {
      res.send({ok: false, reason: 'bad start format'});
      return;
    }
    if (!body.location) {
      res.send({ok: false, reason: 'bad location'});
      return;
    }

    const actions = await getGameActions(this.repository, user, gameId);
    const canEdit = actions.indexOf(GameAction.EDIT) >= 0;

    if (!canEdit) {
      res.send({ok: false, reason: 'Cannot edit the game'});
      return;
    }

    const game = (await repo.getGame(gameId))!;

    const hasPrivilegeOverHome = await isMyTeam(repo, user, game.homeTeam);
    
    const status = user.role === Roles.ASSIGNOR || user.role === Roles.ADMIN
      ? GameStatus.ACCEPTED
      : hasPrivilegeOverHome
      ? GameStatus.PENDING_AWAY_TEAM
      : GameStatus.PENDING_HOME_TEAM;

    const updaterType = await getUpdaterType(repo, user, game!);

    const message = await this._checkConflict(game.homeTeam.id, game.awayTeam.id, body.start);
    if (message) {
      res.send({ok: false, reason: message});
      return;
    }

    await this.repository.editGame({
      id: game.id,
      start: body.start,
      location: body.location,
      status
    });

    const historyId = await this.repository.addGameHistory({
      gameId: game.id,
      start: body.start,
      location: body.location,
      status,
      timestamp: moment(),
      updateType: 'update',
      updaterType: updaterType,
      updaterId: user.id
    });

    res.send({ ok: true});

    this._gameEdit$.next({oldGame: game, historyId});
  }

  getGameHistory = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const history = await this.repository.getGameHistoriesOfGame(id);
    res.send({ok: true, history: history});
  }
}