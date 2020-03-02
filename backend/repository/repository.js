const { moment, FORMAT_DATE_TIME } = require('../moment');
const sqlUtils = require('./sql_utils');
const assert = require('assert');

const NAME_QUERY_LIMIT = 10;

module.exports = function(mysql) {
  const GamesQuery = require('./games_query')(mysql);

  /*@param game:  {
    homeTeamId: int,
    awayTeamId: int,
    start: moment | Date,
    locaton: string
  }*/
  function addGame(game) {

    const query = `INSERT INTO GAME (homeTeamId, awayTeamId, start, location, status)
      VALUES ${sqlUtils.sqlValues([
        game.homeTeamId,
        game.awayTeamId,
        game.start,
        game.location,
        game.status,
      ])};`;

    return new Promise(function(resolve, reject){

      mysql.query(query, function(err, result) {
        if (err) return reject(err);

        resolve(result.insertId);
      });
    });
  }

  /*
    @param str: string, substring to match against full team name

    @return Promise<Array<{
      id: int,
      name: string,
      abbrevName: string
    }>>  
  */
  function findTeamsMatchingName(num) {
    if (!str) return Promise.resolve([]);

    str = `'%${sqlUtils.regexEscapedString(str)}%'`;

    const query = `
      SELECT id, schoolId, classId, genId
      FROM TEAM
      WHERE schoolId like num
      LIMIT ${NAME_QUERY_LIMIT};`;

    return new Promise(function(resolve, reject) {

      mysql.query(query, function(err, rows) {
        if (err) return reject(err);

        const teams = rows.map(row => ({ 
          id: row.id,
          schoolId: row.schoolId,
          classId: row.classId,
          genId: row.genId
        }));

        resolve(teams);
      });
    });
  }

  /*
    @param str: string, substring to match against full school name

    @return Promise<Array<{
      id: int,
      name: string,
      abbrevName: string
    }>>  
  */
  function findSchoolsMatchingName(str) {
    if (!str) return Promise.resolve([]);

    str = `'%${sqlUtils.regexEscapedString(str)}%'`;

    const query = `
      SELECT id, name, abbrevName, distId
      FROM SCHOOL
      WHERE name like ${str}
      LIMIT ${NAME_QUERY_LIMIT};`;

    return new Promise(function(resolve, reject) {

      mysql.query(query, function(err, rows) {
        if (err) return reject(err);

        const schools = rows.map(row => ({
          id: row.id,
          name: row.name,
          abbrevName: row.abbrevName
          distId: row.distId
        }));

        resolve(schools);
      });
    });
  }



  /*@param q, @see GamesQuery*/
  function getGames(q) {
    q = q || {};

    const gamesQuery = new GamesQuery(
      q.start_date || null,
      q.end_date || null,
      q.team || null,
      q.home_team || null,
      q.away_team || null,
      q.school || null,
      q.status || null);

    return gamesQuery.execute();
  }

  return {
    addGame,
    getGames,
    findTeamsMatchingName,
    findSchoolsMatchingName
  };

  /*@param q, @see GameEventsQuery*/
  function getEvents(q) {
    q = q || {};

    const gamesQuery = new GamesQuery(
      q.start_date || null,
      q.end_date || null,
      q.team || null,
      q.home_team || null,
      q.away_team || null,
      q.school || null,
      q.status || null);

    return gamesQuery.execute();
  }

  return {
    addGame,
    getGames,
    findTeamsMatchingName,
    findSchoolsMatchingName
  };

  /*@param q, @see GamesVerifyQuery*/
  function getVerify(q) {
    q = q || {};

    const gamesQuery = new GamesQuery(
      q.start_date || null,
      q.end_date || null,
      q.team || null,
      q.home_team || null,
      q.away_team || null,
      q.school || null,
      q.status || null);

    return gamesQuery.execute();
  }

  return {
    addGame,
    getGames,
    findTeamsMatchingName,
    findSchoolsMatchingName
  };
};