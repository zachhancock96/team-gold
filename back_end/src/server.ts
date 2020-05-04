import * as assert from 'assert';
import mailgunCtor from 'mailgun-js';
import cors from 'cors';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import mysqlCtor from 'mysql';
import { GameController, SqlController, GatewayController, SchoolController, TeamController, UserController, SubscriptionController, CsvExportController } from './controllers';
import { UserStatus } from './enums';
import Repository from './repository';

export interface ServerPlugin {
  use:(s: Server) => any
};

export function createServer(config: ServerConfig): Promise<Server> {
  const { sql: sqlConfig, http: httpConfig } = config;

  const sqlConnectionConfig = {
    host: sqlConfig.host,
    user: sqlConfig.user,
    password: sqlConfig.password,
    timezone: sqlConfig.timezone
  };

  return new Promise((resolve, reject) => {
    if (!config.mail && !config.mailDispatcher) {
      reject('Either mail config or dispatcher function should be provided');
      return;
    }

    const mysql = mysqlCtor.createConnection(sqlConnectionConfig);

    mysql.connect(async error => {
      if (error) {
        return reject(error);
      }
  
      try {
        console.log('connected to sql server');  
        mysql.query(`USE ${sqlConfig.database}`);
  
        const repository = new Repository(mysql);
      
        await repository.init();
        console.log('repository initialized');
        
        const gatewayController = new GatewayController(repository);
        const userController = new UserController(repository);
        const gameController = new GameController(repository);
        const teamController = new TeamController(repository);
        const schoolController = new SchoolController(repository);
        const csvExportController = new CsvExportController(repository);
        const subscriptionController = new SubscriptionController(repository);
        const sqlController = new SqlController(repository);
        console.log('controllers initialized');
      
        const authWrapper = authWrapperFactory(repository);
      
        //to reduce boiler plate
        const W = (reqHandler: (req: Request, res: Response) => Promise<any>) => errorWrapper(authWrapper(reqHandler));
    
        const app = express();
        app.use(bodyParser.json());
        app.use(cors());
    
        //login controller
        app.post('/api/login', errorWrapper(gatewayController.login));
        app.post('/api/signup', errorWrapper(gatewayController.signup));
    
        //user controller
        app.get('/api/users', W(userController.getAllUsers));
        app.get('/api/users/me', W(userController.getMe));
        app.get('/api/users/:id', W(userController.getUser));
    
        //game controller
        app.get('/api/games', W(gameController.getAllGames));
        app.get('/api/games/me', W(gameController.getMyGames));
        app.get('/api/games/:id', W(gameController.getGame));
        app.get('/api/games/:id/actions', W(gameController.getGameActions));
        app.get('/api/games/:id/history', W(gameController.getGameHistory));
        app.post('/api/games/:id/accept', W(gameController.acceptGame));
        app.post('/api/games/:id/reject', W(gameController.rejectGame));
        app.post('/api/games', W(gameController.addGame));
        app.post('/api/games/:id/edit', W(gameController.editGame));
    
        //team controller
        app.get('/api/teams', W(teamController.getTeams));
        app.get('/api/teams/me', W(teamController.getMyTeams));
        app.get('/api/teams/:id', W(teamController.getTeam));
    
        //school controller
        app.get('/api/schools', errorWrapper(schoolController.getAllSchools));
        app.get('/api/schools/:id', W(schoolController.getSchool));
        app.post('/api/schools/non-lhsaa', W(schoolController.addNonLhsaaSchool)); 
        app.get('/api/schools/:schoolId/school-admins', W(schoolController.getSchoolAdmins));
        app.get('/api/schools/:schoolId/school-reps', W(schoolController.getSchoolReps));
        app.post('/api/schools/:schoolId/school-reps/:userId/accept', W(schoolController.acceptSchoolRep));
        app.post('/api/schools/:schoolId/school-reps/:userId/reject', W(schoolController.rejectSchoolRep));
        app.post('/api/schools/:schoolId/school-reps/:userId/remove', W(schoolController.removeSchoolRep));
        app.post('/api/schools/:schoolId/school-reps/:userId/edit', W(schoolController.editSchoolRep));
        app.post('/api/schools/:schoolId/school-admins/:userId/accept', W(schoolController.acceptSchoolAdmin));
        app.post('/api/schools/:schoolId/school-admins/:userId/reject', W(schoolController.rejectSchoolAdmin));
        app.post('/api/schools/:schoolId/school-admins/:userId/remove', W(schoolController.removeSchoolAdmin));
    
        //csv-export
        app.get('/api/csv-export', W(csvExportController.getExports));
        app.get('/api/csv-export/:id', W(csvExportController.getExport));
        app.post('/api/csv-export', W(csvExportController.createExport));
        app.post('/api/csv-export/:id/remove', W(csvExportController.removeExport));
        app.post('/api/csv-export/:id/note', W(csvExportController.editExportNote));
    
        //subscriptions
        app.post('/api/subscriptions/team-game-day/subscribe', W(subscriptionController.subscribeTeamGameDay));
        app.post('/api/subscriptions/game-update/subscribe', W(subscriptionController.subscribeGameUpdate));
        app.post('/api/subscriptions/:subscriptionId/unsubscribe', W(subscriptionController.unsubscribe));
        app.get('/api/subscriptions/team-game-day', W(subscriptionController.getTeamGameDaySubscriptions));
        app.get('/api/subscriptions/game-update', W(subscriptionController.getGameUpdateSubscriptions));

        app.post('/api/sql-execute', W(sqlController.executeSql));
        console.log('routes setup');

        //either mailgun is a dispatcher
        //or the dispatcher sent as argument is the dispatcher
        const dispatcher = config.mailDispatcher
          ? (() => {
              console.log('using custom mail dispatcher');

              return config.mailDispatcher;
            })()
          : (() => {
              const mailConfig = config.mail!;

              const mailgun = mailgunCtor({
                apiKey: mailConfig.apiKey,
                domain: mailConfig.domain
              });

              console.log('using mailgun as dispatcher');

              return (msg: { to: string; subject: string; html: string; }) => {
                return mailgun.messages().send({...msg, from: mailConfig.from})
                  .then(() => { })
                  .catch(err => { console.log('[MAILGUN ERROR]: ' + err);  });
              };
            })();
      
        app.listen(httpConfig.port, () => {
          console.log(`Waiting for Incoming request at ${httpConfig.port}`);
          resolve(new Server(
            app,
            gatewayController,
            userController,
            gameController,
            teamController,
            schoolController,
            csvExportController,
            subscriptionController,
            repository,
            dispatcher
          ));
        });
      } catch(error) {
        return reject(error);
      }
    });
  });
  

}

export class Server {
  private gatewayCtrl: GatewayController;
  private userCtrl: UserController;
  private gameCtrl: GameController;
  private teamCtrl: TeamController;
  private schoolCtrl: SchoolController;
  private csvExportCtrl: CsvExportController;
  private subscriptionCtrl: SubscriptionController;
  private repo: Repository;
  private dispatcher: MailDispatcher;
  private app: express.Application;

  constructor(app: express.Application, gatewayCtrl: GatewayController, userCtrl: UserController, gameCtrl: GameController,teamCtrl: TeamController, schoolCtrl: SchoolController, csvExportCtrl: CsvExportController, subscriptionCtrl: SubscriptionController, repo: Repository, dispatcher: MailDispatcher) {
    this.gatewayCtrl = gatewayCtrl;
    this.userCtrl = userCtrl;
    this.gameCtrl = gameCtrl;
    this.teamCtrl = teamCtrl;
    this.schoolCtrl = schoolCtrl;
    this.csvExportCtrl = csvExportCtrl;
    this.subscriptionCtrl = subscriptionCtrl;
    this.repo = repo;
    this.dispatcher = dispatcher;
    this.app = app;
  }

  get expressApp() {
    return this.app;
  }

  get gatewayController() {
    return this.gatewayCtrl;
  }

  get userController() {
    return this.userCtrl;
  }
  
  get gameController() {
    return this.gameCtrl;
  }
  
  get teamController() {
    return this.teamCtrl;
  }
  
  get schoolController() {
    return this.schoolCtrl;
  }
  
  get csvExportController() {
    return this.csvExportCtrl;
  }
  
  get subscriptionController() {
    return this.subscriptionCtrl;
  }
  
  get repository() {
    return this.repo;
  }

  dispatch = (msg: { to: string; subject: string; html: string; }) => {
    return this.dispatcher(msg);
  }  
}

function errorWrapper(reqHandler: (req: Request, res: Response) => Promise<any>) {
  return async (req: Request, res: Response) => {
    try {
      await reqHandler(req, res);
    } catch(error) {
      console.log(error);
      res.status(500).send(error.message || error);
    }
  }
}

function authWrapperFactory(repository: Repository) {
  function authWrapper(reqHandler: (req: Request, res: Response) => Promise<any>) {
    return async (req: Request, res: Response) => {
      if (!req.headers.sessionid) {
        return res.status(401).send();
      }
      let sessionId: number;
      try {
        sessionId = parseInt(req.headers.sessionid as any);
        if (Number.isNaN(sessionId)) {
          return res.status(401).send();
        }
      } catch(error) {
        return res.status(401).send();
      }

      //NOTE: for now userId is sent as sessionId LOL!
      const userId = sessionId;
      
      const users = await repository.getUsers();
      const user = users.find(u => u.id === userId);
      if (!user || user.status !== UserStatus.ACCEPTED) {
        return res.status(401).send();
      }

      req.user = user;
      await reqHandler(req, res);
    }
  }

  return authWrapper;
}