const {  moment, FORMAT_DATE_TIME, FORMAT_DATE } = require('../moment');
const sqlUtils = require('./sql_utils');
const DOC_LIMIT = 200;

module.exports = function(mysql) {

  class GamesQuery {
    /*
      @param startDate: string | null, e.g. "2020-01-01"
      @param endDate: string | null, e.g. "2020-02-01"
      @param teamName: string | null, e.g. "neville jv"
      @param homeTeamName: string | null, e.g. "neville jv"
      @param awayTeamName: string | null, e.g. "grenich vb"
      @param schoolName: string | null, e.g. "neville high school"

      assumes that types and formats of the parameters are correct
    */
    constructor(startDate, endDate, teamName, homeTeamName, awayTeamName, schoolName) {
      this._startDate = startDate;
      this._endDate = endDate;
      this._teamName = teamName;
      this._homeTeamName = homeTeamName;
      this._awayTeamName = awayTeamName;
      this._schoolName = schoolName;
    }

    //if valid, return null
    //else return reason for the invalidity of the query
    validate() {
      const {
        _startDate: startDate,
        _endDate: endDate,
        _teamName: teamName,
        _homeTeamName: homeTeamName,
        _awayTeamName: awayTeamName,
        _schoolName: schoolName
      } = this;

      if (teamName && 
        (
          schoolName ||
          homeTeamName ||
          awayTeamName
        )) {

          return "teamName cannot be queried with schoolName or homeTeamName or awayTeamName";
      }

      if (schoolName &&
        (
          teamName ||
          homeTeamName ||
          awayTeamName
        )) {

          return "schoolName cannot be queried with teamName or homeTeamName or awayTeamName";;
      }

      if (startDate && endDate) {
        const isStartBeforeEnd = moment(startDate).isSameOrBefore(moment(endDate));

        if (!isStartBeforeEnd) return "Start must come before End";  
      }

      return null;
    }

    //if valid returns query statement
    //else returns null
    getQueryStatement() {
      {
        const error = this.validate();
        if (error) return null;
      }

      let {
        _startDate: startDate,
        _endDate: endDate,
      } = this;

      if (endDate) {
        endDate = moment(endDate).add(1, 'day').format(FORMAT_DATE);
      }

      return `
        SELECT G.id as id, HT.name as hName, AT.name as aName, 
          HT.abbrevName as hAbbrevName, AT.abbrevName as aAbbrevName,
          HTSchool.name as htSchoolName, ATSchool.name as atSchoolName,
          homeTeamId, awayTeamId, start, location
        FROM Game G
        JOIN Team HT ON G.homeTeamId=HT.id
        JOIN Team AT ON G.awayTeamId=AT.id
        JOIN School HTSchool ON HTSchool.id=HT.schoolId
        JOIN SCHOOL ATSchool ON ATSchool.id=AT.schoolId
        ${startDate && endDate
          ? `WHERE start >= ${sqlUtils.sqlValue(startDate)} AND start <= ${sqlUtils.sqlValue(endDate)}`
          : (startDate 
            ? `WHERE start >= ${sqlUtils.sqlValue(startDate)}`
            : (endDate
              ? `start <= ${sqlUtils.sqlValue(endDate)}`
              : ''))}
        ORDER BY start ASC`;
    }

    /*
      if query is valid executes query statement
      else throws error

      @return Promsie<Array<{
          id: int,
          homeTeam: {
            id: int,
            name: string,
            abbrevName: string
          },
          awayTeam: {
            id: int,
            name: string,
            abbrevName: string
          },
          start: DateTime (e.g. "2020-03-17T08:00:00-05:00"),
          location: string
      }>>
    */
    execute() {
      {
        const error = this.validate();
        if (error) return this._fail(error);
      }

      let {
        _teamName: teamName,
        _homeTeamName: homeTeamName,
        _awayTeamName: awayTeamName,
        _schoolName: schoolName
      } = this;

      const stmt = this.getQueryStatement();

      return new Promise((resolve, reject) => {

        mysql.query(stmt, function(err, rows) {
          if (err) return reject(err);
  
          if (teamName) {
            teamName = teamName.toLowerCase();
  
            rows = rows.filter(row => 
              row.hName.toLowerCase() == teamName || 
              row.aName.toLowerCase() == teamName);
  
          } else if (homeTeamName && awayTeamName) {
            homeTeamName = homeTeamName.toLowerCase();
            awayTeamName = awayTeamName.toLowerCase();
  
            rows = rows.filter(row =>
              row.hName.toLowerCase() === homeTeamName &&
              row.aName.toLowerCase() === awayTeamName );
  
          } else if (homeTeamName) {
            homeTeamName = homeTeamName.toLowerCase();
  
            rows = rows.filter(row => row.hName.toLowerCase() === homeTeamName);
  
          } else if (awayTeamName) {
            awayTeamName = awayTeamName.toLowerCase();
  
            rows = rows.filter(row => row.aName.toLowerCase() === awayTeamName);
  
          } else if (schoolName) {
            schoolName = schoolName.toLowerCase();
            
            rows = rows.filter(row => 
              row.htSchoolName.toLowerCase() === schoolName ||
              row.atSchoolName.toLowerCase() === schoolName);
          }
          
          const games = rows.reduce((games, row) => {
  
            if (games.length <= DOC_LIMIT) {
              games.push({
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
              });
            }
  
            return games;
          }, []);
  
          resolve(games);
        });    
      })
    }
    
    _fail(reason) {
      return Promise.reject(new Error(reason));
    }
  }

  return GamesQuery;
}