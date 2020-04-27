import { env } from '../env';
import fs from 'fs';
import Repository from '../repository';
import {Request, Response} from 'express';
import { Roles } from '../enums';
import { execSql } from '../sql_exec';

const sqlSourceFilePath = env('sql_execute_source_file');
const sqlExecutor = (() => {
  const host = env('sql_host');
  const user = env('sql_user');
  const password = env('sql_password');
  const database = env('sql_database');

  return execSql({
    host, user,
    password, database,
    sqlSourceFilePath });
})();

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
    const { ok, result } = sqlExecutor();
    console.log(result);

    res.send({ok: true, sqlResult: { ok, result } });
  }
}