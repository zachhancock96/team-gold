const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const PORT = 4000;

app.use(bodyParser.json());

const Repository = require('./repository');

Repository.connect(function(error, repository) {
  if (error) throw error;

  /*
  @response {
    ok: true,
    games: [
      {
        id,
        homeTeam: {
          id,
          teamName
        },
        awayTeam: {
          id,
          teamName
        },
        start,
        end,
        location
      }
    ]
  }
  */
  app.get('/api/games', async function(req, res, next) {
    try {
      const games = await repository.getGames();
    
      res.send({ ok: true, games });
  
    } catch(error) {
      console.log(error);
      res.send({ ok: false, reason: error.message });
    }
  })
  
  /*
  @body {
    homeTeamId,
    awayTeamId,
    start,
    end,
    location
  }

  @response {
    ok: true,
    gameId: int
  }
  */
  app.post('/api/games', async function(req, res, next) {
    try {
      const game = {
        homeTeamId: req.body.homeTeamId,
        awayTeamId: req.body.awayTeamId,
        start: req.body.start,
        end: req.body.end,
        location: req.body.location
      };
    
      const gameId = await repository.addGame(game);
    
      res.send({ ok: true, gameId });
  
    } catch(error) {
      console.log(error);
      res.send({ ok: false, reason: error.message });
    }
  })
  
})

app.listen(PORT, () => {
  console.log('Server running in port ' + PORT);
});