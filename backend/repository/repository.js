const { moment, FORMAT_DATE_TIME } = require('../moment');
const sqlUtils = require('./sql_utils');
const assert = require('assert');

const NAME_QUERY_LIMIT = 10;

module.exports = function(mysql) {
  const GamesQuery = require('./games_query')(mysql);

  /*@param game:  {
    homeTeamId: int,
    awayTeamId: int,
    start: moment | Date | Date like string,
    locaton: string
  }*/
  function addGame(game) {

    const query = `INSERT INTO Game (homeTeamId, awayTeamId, start, location)
      VALUES ${sqlUtils.sqlValues([
        game.homeTeamId,
        game.awayTeamId,
        game.start,
        game.location
      ])};`;

    return new Promise(function(resolve, reject){

      mysql.query(query, function(err, result) {
        if (err) return reject(err);

        resolve(result.insertId);
      });
    });
  }

  /*@deprecated*/
  function getGames_old() {

    const query = `
      SELECT G.id as id, HTeam.name as hName, ATeam.name as aName, HTeam.abbrevName as hAbbrevName, ATeam.abbrevName as aAbbrevName, homeTeamId, awayTeamId, start, location
      FROM Game G
      JOIN Team HTeam ON G.homeTeamId=HTeam.id
      JOIN Team ATeam ON G.awayTeamId=ATeam.id;`;

    return new Promise(function(resolve, reject) {

      mysql.query(query, function(err, rows) {
        if (err) return  reject(err);

        const games = rows.map(row => ({
          id: row.id,
          start: moment(row.start).format(FORMAT_DATE_TIME),
          location: row.location,
          homeTeam: {
            id: row.homeTeamId,
            name: row.hName,
            abbrevName: row.hAbbrevName
          },
          awayTeam: {
            id: row.awayTeamId,
            name: row.aName,
            abbrevName: row.aAbbrevName
          }
        }));

        resolve(games);
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
  function findTeamsMatchingName(str) {
    if (!str) return Promise.resolve([]);

    str = `'%${sqlUtils.regexEscapedString(str)}%'`;

    const query = `
      SELECT id, name, abbrevName
      FROM Team
      WHERE name like ${str}
      LIMIT ${NAME_QUERY_LIMIT};`;

    return new Promise(function(resolve, reject) {

      mysql.query(query, function(err, rows) {
        if (err) return reject(err);

        const teams = rows.map(row => ({ 
          id: row.id,
          name: row.name,
          abbrevName: row.abbrevName
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
      SELECT id, name, abbrevName
      FROM School
      WHERE name like ${str}
      LIMIT ${NAME_QUERY_LIMIT};`;

    return new Promise(function(resolve, reject) {

      mysql.query(query, function(err, rows) {
        if (err) return reject(err);

        const schools = rows.map(row => ({
          id: row.id,
          name: row.name,
          abbrevName: row.abbrevName
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
      q.school || null);

    return gamesQuery.execute();
  }

  return {
    addGame,
    getGames_old,
    getGames,
    findTeamsMatchingName,
    findSchoolsMatchingName
  };
};