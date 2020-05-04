const fs = require('fs');
const cp = require('child_process');

const env = s => {
  const v = process.env[s];
  if (v === undefined || v === null) throw new Error(`Env variable ${s} not found`);
  return v; 
};

const exit = code => code? process.exit(code): process.exit();

const connString = ({hostname, username, password, database}) => {
  let str = `mysql -h ${hostname} -u ${username}`;
  str = password? `${str} -p ${password}`: str;
  str = database? `${str} ${database}`: str;

  return str;
}

const CONN_CONFIG = {
  hostname: env('SQL_HOST'),
  username: env('SQL_USER'),
  password: env('SQL_PASSWORD'),
  database: env('SQL_DATABASE')
};

const sqlFilePath = process.argv.length >= 3 && process.argv[2];
if (!sqlFilePath) {
  console.log('Sql file path should be provided as cmd line argument');
  exit(1);
  return;
}

const connStr = connString(CONN_CONFIG);
const spawnCommand = `${connStr} < ${sqlFilePath}`;
console.log(`executing following command: ${spawnCommand}`);

cp.execSync(`${connStr} < ${sqlFilePath}`, { stdio: 'pipe' });