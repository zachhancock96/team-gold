import { env } from '../env';
import cp from 'child_process';
import fs from 'fs';
import Repository from '../repository';
import {Request, Response} from 'express';
import { Roles } from '../enums';

const sqlSourceFilePath = env('sql_execute_source_file');

const spawnCommand = (() => {
  const connString = (() => {
    const host = env('sql_host');
    const user = env('sql_user');
    const password = env('sql_password');
    const database = env('sql_database');
    
    let str = `mysql -h ${host} -u ${user} --table`;
    str = password? `${str} -p ${password}`: str;
    str = database? `${str} ${database}`: str;
  
    return str;
  })();

  return `${connString} < ${sqlSourceFilePath}`;
})();

const execSql = () => {
  try {
    const result = cp.execSync(`${spawnCommand}`, { stdio: 'pipe', encoding: 'ascii', maxBuffer: 1024 * 1024 * 10 });
    return { ok: true, result };
  } catch(error) {
    return { ok: false, result: error.stderr as string };
  }  
}

export default class SqlController {

  private repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  executeSql = async (req: Request, res: Response) => {
    const user = req.user!;
    if (user.role !== Roles.ADMIN) {
      res.send({ok: false, reason: 'Only admin'});
      return;
    }

    const sql = req.body.sql;
    if (!sql || typeof sql !== 'string') {
      res.send({ok: false, reason: 'sql parameter must be string'});
      return;
    }

    fs.writeFileSync(sqlSourceFilePath, sql);
    const { ok, result } = execSql();
    console.log(result);


    res.send({ok: true, sqlResult: { ok, result } });
  }
}