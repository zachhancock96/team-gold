import * as assert from 'assert';
import cors from 'cors';
import express, { Request, Response } from 'express';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import { UserStatus } from './enums';

import {  
  GameController,
  GatewayController,
  SchoolController,
  TeamController,
  UserController,
  SubscriptionController,
  CsvExportController } from './controllers';
import Repository from './repository';

const PORT = 4000;

const app = express();
app.use(bodyParser.json());
app.use(cors());

function connectMysql(callback: (err: Error | null, mysql: mysql.Connection | null) => any) {
  const mysqlCtor = require('mysql');

  const CONN_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: '',
    timezone: '+00:00'
  };

  const mysql = mysqlCtor.createConnection(CONN_CONFIG);

  mysql.connect(function(error) {
    if (error) return callback(error, null);

    console.log('connected to sql server');

    mysql.query('USE SoccerSchedule');

    callback(null, mysql);
  });
}

connectMysql(async (err, mysql) => {
  if (err) {
    console.log(err);
    return process.exit();
  }
  console.log('mysql connected');
  
  const repository = new Repository(mysql!);
  await repository.init();
  console.log('finish init repository');
  
  const gatewayController = new GatewayController(repository);
  const userController = new UserController(repository);
  const gameController = new GameController(repository);
  const teamController = new TeamController(repository);
  const schoolController = new SchoolController(repository);
  const csvExportController = new CsvExportController(repository);
  const subscriptionController = new SubscriptionController(repository);

  const authWrapper = authWrapperFactory(repository);

  //to reduce boiler plate
  const W = (reqHandler: (req: Request, res: Response) => Promise<any>) => errorWrapper(authWrapper(reqHandler));
  
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
  app.get('/api/schools', W(schoolController.getAllSchools));
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

  app.post('/api/subscriptions/team-game-day/subscribe', W(subscriptionController.subscribeTeamGameDay));
  app.post('/api/subscriptions/game-update/subscribe', W(subscriptionController.subscribeGameUpdate));
  app.post('/api/subscriptions/:subscriptionId/unsubscribe', W(subscriptionController.unsubscribe));
  app.get('/api/subscriptions/team-game-day', W(subscriptionController.getTeamGameDaySubscriptions));
  app.get('/api/subscriptions/game-update', W(subscriptionController.getGameUpdateSubscriptions));
  
  app.listen(PORT, () => {
    console.log(`server listening at port ${PORT}`);
  });
});

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