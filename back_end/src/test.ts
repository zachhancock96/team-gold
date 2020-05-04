import mysql from 'mysql';
import fs from 'fs';

import Repository from './repository';

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

  const out = './out';

  console.log('testing repository....');
  console.log(`see file output at ${out}`);
  
  console.log('mysql connected');
  
  const repository = new Repository(mysql!);
  await repository.init();

  const districts = await repository.getDistricts();

  let s = '';
  districts.forEach(d => {
    s += d.toString();
  });

  fs.writeFileSync(out, s);
  console.log('testing done');

  process.exit();
});