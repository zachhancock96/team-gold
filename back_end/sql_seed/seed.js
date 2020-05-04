const path = require('path');
const cp = require('child_process');
const dotenv = require('dotenv');

const env = s => {
  if (process.env[s] !== undefined) return process.env[s];
  throw new Error(`Env variable ${s} not found`);
};

const here = filename => path.join(__dirname, filename);

const exec = (path, args, callback) => {
  if (typeof args === 'function') {
    callback = args;
    args = [];
  }
  const proc = cp.fork(path, args);

  proc.on('exit', code => {
    if (code) {
      callback(new Error('exit code: ' + code));
      return;
    }
    callback();
  });
}

const exit = () => process.exit();

const highlightLog = str => {
  console.log(
`

-------------------------------------------
${str}
-------------------------------------------

`);
}


dotenv.config({path: here('.env')});
highlightLog('env variables loaded');

exec(here('./seed_data_to_json.js'), err => {
  if (err) {
    console.log('converting to JSON ERRORED');
    return exit();
  }  
  highlightLog('converting to JSON success');

  exec(here('./seed_data_to_sql.js'), err => {
    if (err) {
      console.log('converting to SQL ERRORED');
      return exit();
    }
    highlightLog('converting to SQL success');

    exec(here('./sql_file_exec.js'), [env('FILENAME_SEED_TABLE_SQL')], err => {
      if (err) {
        console.log('creating sql tables failed');
        return exit();
      }
      highlightLog('creating sql tables success');

      exec(here('./sql_file_exec.js'), [env('FILENAME_SEED_DATA_SQL')], err => {
        if (err) {
          highlightLog('seeding data into database ERRORED');
          return exit();
        }
        highlightLog('seeding data into database success');
  
        exit();
      });
    });
  });
});