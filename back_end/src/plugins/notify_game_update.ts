import { ServerPlugin, Server } from '../server';
import User from '../user';
import School from '../school';
import Game, { GameHistory } from '../game';
import Team from '../team';
import { GameStatus } from '../enums';

function use(server: Server) {
  const repo = server.repository;
  const gameUpdate$ = server.gameController.gameUpdate$;
  const gameEdit$ = server.gameController.gameEdit$;

  const getGameUpdateSubscribers = async (game: Game) => {
    const emailSubscriptions = await repo.getEmailSubscriptions();
    const subscriberIds = emailSubscriptions
      .filter(e => e.subscriptionType === 'game_update' && e.gameId === game.id)
      .map(e => e.subscriberId);
  
    const users = await repo.getUsers();
    return users.filter(user => subscriberIds.indexOf(user.id) >= 0);
  }  

  gameEdit$.subscribe(async ({oldGame, historyId}) => {
    const history = (await repo.getGameHistory(historyId))!;
    const currentGame = (await repo.getGame(history.gameId))!;

    const subscribers = await getGameUpdateSubscribers(currentGame);
    subscribers.forEach(u => {
      server.dispatch({
        to: u.email,
        subject: 'Game edited',
        html: composeEdit(u, history, oldGame, currentGame)
      });
    });    
  });

  gameUpdate$.subscribe(async historyId => {
    const history = (await repo.getGameHistory(historyId))!;
    const game = (await repo.getGame(history.gameId))!;

    if (history.updateType === 'create') {
      const schoolAdmin = (team: Team) => {
        return team.school.schoolAdmin;
      }

      const homeAdmin = schoolAdmin(game.homeTeam);
      const awayAdmin = schoolAdmin(game.awayTeam);

      let users = [
        ...game.homeTeam.schoolReps,
        ...game.awayTeam.schoolReps
      ];
      
      if (homeAdmin) users.push(homeAdmin);
      if (awayAdmin) users.push(awayAdmin);
      
      users.forEach(u => {
        server.dispatch({
          to: u.email,
          html: composeCreate(u, history, game),
          subject: 'Game created'
        });
      });

      return;
    }
    
    const subscribers = await getGameUpdateSubscribers(game);

    if (history.updateType === 'accept') {
      const [fn, subject] = game.status === GameStatus.ACCEPTED
        ? [composeApprove, 'Game approved']
        : [composeAccept, 'Game accepted']
      
      subscribers.forEach(u => {
        server.dispatch({
          to: u.email,
          html: fn(u, history, game),
          subject
        });
      });
    }

    if (history.updateType === 'reject') {
      subscribers.forEach(u => {
        server.dispatch({
          to: u.email,
          html: composeReject(u, history, game),
          subject: 'Game rejected'
        });
      })
    }
  });
}

const composeCreate = (user: User, history: GameHistory, game: Game) => {
  return `
    <p>Hello ${user.firstName},</p>
    ${prettyGame(game)}
    <p>The above game was created by ${prettyUpdater(history)}.</p>`;
}

const composeAccept = (user: User, history: GameHistory, game: Game) => {

  return `
    <p>Hello ${user.firstName},</p>
    ${prettyGame(game)}
    <p>The above game has been been accepted by ${prettyUpdater(history)}.
       The game is now awaiting assignor's approval.</p>
    ${footer}`;
}

const composeApprove = (user: User, history: GameHistory, game: Game) => {
  return `
    <p>Hello ${user.firstName},</p>
    ${prettyGame(game)}
    <p>The above game has been been approved by ${prettyUpdater(history)}.</p>
    ${footer}`;
}

const composeEdit = (user: User, history: GameHistory, oldGame: Game, game: Game) => {
  return `
    <p>Hello ${user.firstName},</p>
    ${prettyGame(oldGame)}
    <p>The above game has been been edited by ${prettyUpdater(history)} as:</p>
    ${prettyGame(game)}
    ${footer}  
  `;
}

const composeReject = (user: User, history: GameHistory, game: Game) => {
  return `
    <p>Hello ${user.firstName},</p>
    ${prettyGame(game)}
    <p>The above game has been been rejected by ${prettyUpdater(history)}.
       The game is now archived.</p>
    ${footer}`;
}

const prettyUpdater = (history: GameHistory) => {
  return history.updaterType === 'admin'
    ? 'the Admin of the system'
    : history.updaterType === 'assignor'
    ? 'the Assignor'
    : history.updaterType === 'home'
    ? 'a representative of the Home team'
    : 'a representative of the Away team';
}

const prettyGame = (game: Game) => {
  const tab = '&nbsp;&nbsp;&nbsp;&nbsp;';
  return `
    <p>${tab}<b>Home: </b>${game.homeTeam.name}<p>
    <p>${tab}<b>Away: </b>${game.awayTeam.name}<p>
    <p>${tab}<b>Level: </b>${game.level}<p>
    <p>${tab}<b>${game.prettyStart} @ ${game.location}</b><p>`;
}

const footer = `
  <p><i>If you do not want to recieve any updates on this game, you do so by manging notification
    settings for this game in the application.<i></p>
  <p>Thanks</p>
`;


const e: ServerPlugin = { use };
export default e;