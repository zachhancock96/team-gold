const moment = require('moment-timezone'); moment.tz.setDefault('America/Chicago');
const mysqlCtor = require('mysql');
const assert = require('assert');

const CONN_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: ''
};

function connect(callback) {
  const mysql = mysqlCtor.createConnection(CONN_CONFIG);

  mysql.connect(function(error) {
    if (error) return callback(error, null);

    console.log('connected to sql server');
    mysql.query('USE SoccerSchedule');
    
    function addGame(game) {

      const query = `INSERT INTO Game (homeTeamId, awayTeamId, start, end, location)
        VALUES ${sqlUtils.sqlValues([
          game.homeTeamId,
          game.awayTeamId,
          game.start,
          game.end,
          game.location
        ])};`;

      console.log(query);

      return new Promise(function(resolve, reject){

        mysql.query(query, function(err, result) {
          if (err) return reject(err);

          resolve(result.insertId);
        });
      });
    }

    function getGames() {

      const query = `
        SELECT G.id as id, HTeam.teamName as homeTeamName, ATeam.teamName as awayTeamName, homeTeamId, awayTeamId, start, end, location
        FROM Game G
        JOIN Team HTeam ON G.homeTeamId=HTeam.id
        JOIN Team ATeam ON G.awayTeamId=ATeam.id;`;

      return new Promise(function(resolve, reject){

        mysql.query(query, function(err, rows) {
          if (err) return  reject(err);

          const games = rows.map(row => ({
            id: row.id,
            start: row.start,
            end: row.end,
            location: row.location,
            homeTeam: {
              id: row.homeTeamId,
              teamName: row.homeTeamName
            },
            awayTeam: {
              id: row.awayTeamId,
              teamName: row.awayTeamName
            }
          }));

          resolve(games);
        });
      });

    }

    callback(null, {
      addGame,
      getGames
    });
  });
}

module.exports = { 
  connect
}


const sqlUtils = (function() {
  /*
    @param array: Array<> 
    @return format that sql likes when inserting it
  
    e.g. [1, 2, 3, 'hello', null, undefined, moment()] to (1,2,3,'hello',null,null,'2019-10-21T02:07:56.752Z')
  */
  function sqlValues(array) {
    assert.ok(Array.isArray(array));
  
    array = array
      .map(r => r instanceof Date? moment(r).toISOString(true): r)
      .map(r => r instanceof moment? r.toISOString(true): r)
      .map(r => typeof r === 'string'? `'${r}'`: r)
      .map(r => (r === null || r === undefined)? 'null': r);
      
    return '(' + array.join(',') + ')';
  }
  
  
  function sqlValue(v) {
    if (v instanceof moment) v = v.toISOString(true);
    if (typeof v === 'string') return `'${v}'`;
    if (v === null || v === undefined) return 'null';
    return v;
  }

  return {
    sqlValues,
    sqlValue
  };
})();