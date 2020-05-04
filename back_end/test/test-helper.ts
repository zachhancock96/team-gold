import request from 'supertest'
import { createServer, Server } from '../src/server';
import { env } from '../src/env';
import { execSql } from '../src/sql_exec';

let serverInstance: Server;
let didInit = false;

export const getServerInstance = () => {
  return serverInstance!;
}

export const init = async () => {
  if (didInit) {
    return Promise.reject('already init');
  }

  await resetDatabase();

  const serverConfig = {
    sql: {
      host: env('sql_host')!,
      user: env('sql_user')!,
      password: env('sql_password')!,
      timezone: env('sql_timezone')!,
      database: env('sql_database')!
    },
    http: {
      port: parseInt(env('http_port')!)
    },
    mailDispatcher: msg => { return Promise.resolve(); }
  } as ServerConfig;

  return createServer(serverConfig)
    .then(server => {
      serverInstance = server;
    });
}

export const [resetDatabase, seedGameData] = (() => {
  const sqlResetSeedPath = env('sql_reset_seed');
  const sqlGameTestSeedPath = env('sql_game_test_seed');

  const host = env('sql_host');
  const user = env('sql_user');
  const password = env('sql_password');
  const database = env('sql_database');

  
  const resetExecutor = execSql({
    host, user,
    password, database,
    sqlSourceFilePath: sqlResetSeedPath });

  //first reset and then seed
  const seedGameExecutor = (() => {
    const executor = execSql({
      host, user,
      password, database,
      sqlSourceFilePath: sqlGameTestSeedPath
    });

    return () => {
      const result = resetExecutor();
      if (!result.ok) { 
        return result;
      }
      return executor();
    };
  })();


  const wrapper = (executor: () => ({ ok: boolean; result: string})) => async () => {
    const { ok, result } = executor();
    if (!ok) {
      throw new Error('Error executing sql files: ' + result);
    }
    if (serverInstance) {
      await serverInstance.repository.refresh();
    }
  };

  return [wrapper(resetExecutor), wrapper(seedGameExecutor)];
})();

export const withHeader = (app: request.Test, userId: number) => {
  return app.set('Content-Type', 'application/json').set('sessionid', `${userId}`);
}

export const focusedLog = o => {
  console.log(`
  -------------------------------
      ${o}
  -------------------------------`);
}