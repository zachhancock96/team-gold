const assert = require('assert');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { moment, FORMAT_DATE_TIME, FORMAT_DATE } = require('./moment');

const PORT = 4000;

function connectMysql(callback) {
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

connectMysql((error, mysql) => {
  if (error) throw error;

  const repository = require('./repository')(mysql);
  
  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  /*
  @response {
    ok: true,
    games: [
      {
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
        location: string,
        status: status
      }
    ]
  }
  */
 app.get('/api/games', async function(req, res, next) {
    try {
      const q = req.query || {};
      q.start_date = q.start_date || null;
      q.end_date = q.end_date || null;
      q.team = q.team || null;
      q.home_team = q.home_team || null;
      q.away_team = q.away_team || null;
      q.school = q.school || null;
      q.status = q.status || null;

      if (q.start_date !== null) {
        const isValidFormat = moment(q.start_date, FORMAT_DATE, true).isValid();
        if (!isValidFormat) {
          return res.send({
            ok: false,
            reason: `illegal start_date query parameter`
          });
        }
      }

      if (q.end_date != null) {
        const isValidFormat = moment(q.end_date, FORMAT_DATE, true).isValid();
        if (!isValidFormat) {
          return res.send({
            ok: false,
            reason: `illegal end_date query paramter`
          });
        }
      }

      const games = await repository.getGames(q);
    
      res.send({ ok: true, games });

    } catch(error) {
      console.log(error);
      res.send({ ok: false, reason: error.message });
    }
  });

  /*
    @response {
      ok: true,
      schools: [
        {
          id: int,
          name: string,
          abbrevName: string
        }
      ]
    }
  */
  app.get('/api/teams/names', async function(req, res, next) {
    try {
      const match = req.query.match || '';

      const teams = await repository.findTeamsMatchingName(match);

      res.send({ok: true, teams});
       
    } catch(error) {
      console.log(error);
      res.send({ ok: false, reason: error.message });
    }
  });


  /*
    @response {
      ok: true,
      schools: [
        {
          id: int,
          name: string,
          abbrevName: string
        }
      ]
    }  
  */
  app.get('/api/schools/names', async function(req, res, next) {
    try {
      const match = req.query.match || '';

      const schools = await repository.findSchoolsMatchingName(match);

      res.send({ok: true, schools});

    } catch(error) {
      console.log(error);
      res.send({ ok: false, reason: error.message });
    }
  });

  /*
  @body {
    homeTeamId,
    awayTeamId,
    start,
    location,
    status
  }

  @response {
    ok: true,
    gameId: int
  }
  */
  app.post('/api/games', async function(req, res, next) {
    try {
      const start = moment(req.body.start, FORMAT_DATE_TIME, true);
      if (!start.isValid()) {
        return res.send({
          ok: false,
          reason: `start should have following format ${FORMAT_DATE_TIME}`
        });
      }

      const game = {
        homeTeamId: req.body.homeTeamId,
        awayTeamId: req.body.awayTeamId,
        start,
        location: req.body.location,
        status: req.body.status
      };

      const gameId = await repository.addGame(game);
    
      res.send({ ok: true, gameId });

    } catch(error) {
      console.log(error);
      res.send({ ok: false, reason: error.message });
    }
  });

  app.listen(PORT, () => {
    console.log('Server running in port ' + PORT);
  });  
});