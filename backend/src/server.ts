import * as assert from 'assert';
import cors from 'cors';
import express, { Request, Response } from 'express';
import mysql from 'mysql';
import bodyParser from 'body-parser';

import {  
  GameController,
  LoginController,
  SchoolController,
  TeamController,
  UserController } from './controllers';
import PrivilegeAccess from './privilege_access';
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

  const privilegeAccess = new PrivilegeAccess(repository);
  
  const loginController = new LoginController(repository);
  const userController = new UserController(repository);
  const gameController = new GameController(repository, privilegeAccess);
  const teamController = new TeamController(repository, privilegeAccess);
  const schoolController = new SchoolController(repository, privilegeAccess);

  const authWrapper = authWrapperFactory(repository);

  //to reduce boiler plate
  const W = (reqHandler: (req: Request, res: Response) => Promise<any>) => errorWrapper(authWrapper(reqHandler));
  
  //login controller
  app.post('/api/login', errorWrapper(loginController.login));

  //user controller
  app.get('/api/users', W(userController.getAllUsers));
  app.get('/api/users/:id', W(userController.getUser));

  //game controller
  app.get('/api/games', W(gameController.getAllGames));
  app.get('/api/games/:id', W(gameController.getGame));
  app.get('/api/users/:userId/privileges/:privileges/games', W(gameController.getGamesWithPrivilegesForUser));
  app.post('/api/games', W(gameController.addGame));
  app.post('/api/games/:id/edit', W(gameController.editGame));
  app.post('/api/games/:id/accept', W(gameController.acceptGame));
  app.post('/api/games/:id/reject', W(gameController.rejectGame));
  app.post('/api/games/:id/approve', W(gameController.approveGame));

  //team controller
  app.get('/api/teams', W(teamController.getAllTeams));
  app.get('/api/teams/:id', W(teamController.getTeam));
  app.get('/api/users/:userId/privileges/:privileges/teams', W(teamController.getTeamsWithPrivilegesForUser));

  //school controller
  app.get('/api/schools', W(schoolController.getAllSchools));
  app.get('/api/schools/:id', W(schoolController.getSchool));
  app.get('/api/users/:userId/privileges/:privileges/schools', W(schoolController.getSchoolsWithPrivilegesForUser));

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
      if (!user) {
        return res.status(401).send();
      }

      req.user = user;
      await reqHandler(req, res);
    }
  }

  return authWrapper;
}
