import request from 'supertest';
import { getServerInstance, seedGameData, resetDatabase, withHeader } from './test-helper';
import { Server } from '../src/server';
import Team from '../src/team';
import User from '../src/user';
import School from '../src/school';
import { GameStatus, TeamKind } from '../src/enums';
import { async } from 'rxjs/internal/scheduler/async';

/*



describe: group of test
it: individual test cases that make up the group
expect: returns suspense object which has bunch of useful asssertion functions
xdescribe: disables specs in its function body
fdescribe: only run specs in funciton body below (there might be npm ERR! messages at end ignore those)
beforeAll: run function body before any other specs execute in the describe scope
afterAll: run function body after every other specs execute in the describe scope
beforeEach: similar to beforeAll you know it
afterEach: similar to afterAll you know it
*/
describe('Game should work', () => {
  const server = getServerInstance();
  const repo = server.repository;

  const assertGameStatus = async (gameId: number, gameStatus: GameStatus) => {
    const game = (await repo.getGame(gameId))!;
    expect(game.status).toBe(gameStatus);
  }

  describe('Normal flow, editaccept/reject/approve; game status and history should update accordingly', () => {
    let homeTeam: Team;
    let awayTeam: Team;
    let homeRep: User;
    let awayRep: User;
    let assignor: User;
    let server: Server;

    //this will get initialized once home team adds game
    let newGameId: number;

    beforeAll(async () => {
      await seedGameData();

      homeTeam = (await repo.getTeam(1))!;
      awayTeam = (await repo.getTeam(5))!;
      assignor = await repo.getAssignor();
      homeRep = (await repo.getUser(3))!;
      awayRep = (await repo.getUser(7))!;
      server = getServerInstance();
    })
  
    afterAll(async () => {
      await resetDatabase();
    })

    it ('variables should be initialized', () => {
      [homeTeam,awayTeam,homeRep,awayRep,assignor]
        .forEach(x => expect(x).toBeDefined());
    })

    it('should fail without auth header', async () => {
      await request(server.expressApp)
        .get('/api/games')
        .expect(401);
    })

    it('should have 0 games', async () => {
      const response = await withHeader(
        request(server.expressApp).get('/api/games'), homeRep.id
      ).expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.games.length).toBe(0);        
    })

    it('adding game as home team', async () => {
      const { body } = await withHeader(request(server.expressApp)
        .post('/api/games'), homeRep.id)
        .send({
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          start: '2020-08-08T01:00:00',
          location: 'loc'
        });

      expect(body.ok).toBe(true);
      expect(body.gameId).toBeDefined();
      newGameId = body.gameId;
    })

    it('should have 1 game', async () => {
      const { body } = await withHeader(request(server.expressApp)
      .get('/api/games'), homeRep.id)
      .expect(200);

      expect(body.ok).toBe(true);
      expect(body.games.length).toBe(1);
    })

    it('should have pending away team status', async () => {
      await assertGameStatus(newGameId, GameStatus.PENDING_AWAY_TEAM);
    })

    it('away team edits', async () => {
      const { body } = await withHeader(request(server.expressApp)
      .post(`/api/games/${newGameId}/edit`), awayRep.id)
      .send({
        start: '2020-08-08T01:00:00',
        location: 'new_loc'
      })
      .expect(200);

      expect(body.ok).toBe(true);
    })

    it('game should have pending home team', async () => {
      await assertGameStatus(newGameId, GameStatus.PENDING_HOME_TEAM);
    })

    it('home team edit', async () => {
      const { body } = await withHeader(request(server.expressApp)
        .post(`/api/games/${newGameId}/edit`), homeRep.id)
        .send({
          start: '2020-08-08T01:00:00',
          location: 'new_loc_again'
        })
        .expect(200);

      expect(body.ok).toBe(true);
    })

    it('game should have pending away team', async () => {
      await assertGameStatus(newGameId, GameStatus.PENDING_AWAY_TEAM);
    })

    it('away team accepts', async () => {
      const { body } = await withHeader(request(server.expressApp)
        .post(`/api/games/${newGameId}/accept`), awayRep.id)
        .expect(200);

      expect(body.ok).toBe(true);
    })

    it('game should have pending_assignor', async () => {
      await assertGameStatus(newGameId, GameStatus.PENDING_ASSIGNOR);
    })

    it('assignor accepts', async () => {
      const { body } = await withHeader(request(server.expressApp)
        .post(`/api/games/${newGameId}/accept`), assignor.id)
        .expect(200);

      expect(body.ok).toBe(true);
    })

    it('game should have accepted', async () => {
      const game = (await repo.getGame(newGameId))!;
      expect(game.status).toBe(GameStatus.ACCEPTED);
    })

    it('assignor edits', async () => {
      const { body } = await withHeader(request(server.expressApp)
        .post(`/api/games/${newGameId}/edit`), assignor.id)
        .send({
          start: '2020-08-08T01:00:00',
          location: 'assignor_loc'
        })
        .expect(200);

      expect(body.ok).toBe(true);
    })

    it('still game staus accepted', async () => {
      await assertGameStatus(newGameId, GameStatus.ACCEPTED);
    })

    it('assignor rejects', async () => {
      const { body } = await withHeader(request(server.expressApp)
        .post(`/api/games/${newGameId}/reject`), assignor.id)
        .expect(200);

      expect(body.ok).toBe(true);
    })

    it('game status rejected', async () => {
      await assertGameStatus(newGameId, GameStatus.REJECTED);
    })

    it('game history should reflect all the changes', async () => {
      const history = await repo.getGameHistoriesOfGame(newGameId);
      expect(history.length).toBe(7);
      expect(history[0].updateType === 'create').toBe(true);//create
      expect(history[0].updaterType === 'home').toBe(true);//create

      expect(history[1].updateType === 'update').toBe(true);//away edits
      expect(history[1].updaterType === 'away').toBe(true);//away edits

      expect(history[2].updateType === 'update').toBe(true);//home edits
      expect(history[2].updaterType === 'home').toBe(true);//home edits

      expect(history[3].updateType === 'accept').toBe(true);//away accepts
      expect(history[3].updaterType === 'away').toBe(true);//away accepts

      expect(history[4].updateType === 'accept').toBe(true);//assignor accepts
      expect(history[4].updaterType === 'assignor').toBe(true);//assignor accepts

      expect(history[5].updateType === 'update').toBe(true);//assignor updates
      expect(history[5].updaterType === 'assignor').toBe(true);//assignor updates

      expect(history[6].updateType === 'reject').toBe(true);//assignor rejects
      expect(history[6].updaterType === 'assignor').toBe(true);//assignor rejects    
    })
  })

  fdescribe('Exception cases', () => {
    let school1: School;
    let school1Rep: User;
    let school1RepPending: User;
    let school1Admin: User;

    let school2: School;
    let school2Rep: User;

    beforeAll(async () => {
      await seedGameData();

      school1 = (await repo.getSchool(1))!;
      school1Rep = (await repo.getUser(3))!;
      school1RepPending = (await repo.getUser(5))!;
      school1Admin = (await repo.getUser(6))!;

      school2 = (await repo.getSchool(2))!;
      school2Rep = (await repo.getUser(7))!;
    })   

    afterAll(async () => {
      await resetDatabase();
    })

    it ('variables should be initialized', () => {
      [school1,school1Rep,school1RepPending,school1Admin,school2, school2Rep]
        .forEach((x, i) => { if (!x) { console.log(i); expect(x).toBeDefined() } });
    })

    it('Adding game with nonexisting homeTeamId should fail', async () => {
      const { body } = await withHeader(request(server.expressApp)
      .post('/api/games'), school1Rep.id)
      .send({
        homeTeamId: 51,
        awayTeamId: school2.teams[0].id,
        start: '2020-08-08T01:00:00',
        location: 'loc'
      });

      expect(body.ok).toBe(false);
      expect(body.gameId).toBeUndefined();
    })

    it('Adding game with nonexisting awayTeamId should fail', async () => {
      const { body } = await withHeader(request(server.expressApp)
      .post('/api/games'), school1Rep.id)
      .send({
        homeTeamId: school1.teams[0].id,
        awayTeamId: 999,
        start: '2020-08-08T01:00:00',
        location: 'loc'
      });

      expect(body.ok).toBe(false);
      expect(body.gameId).toBeUndefined();
    })


    it('Adding game with bad date format should fail', async () => {
      const { body } = await withHeader(request(server.expressApp)
      .post('/api/games'), school1Rep.id)
      .send({
        homeTeamId: school1.teams[0].id,
        awayTeamId: school2.teams[0].id,
        start: '2020-08-08T26:00:00',
        location: 'loc'
      });

      expect(body.ok).toBe(false);
      expect(body.gameId).toBeUndefined();
    })

    it('Adding game with empty location should fail', async () => {
      const { body } = await withHeader(request(server.expressApp)
      .post('/api/games'), school1Rep.id)
      .send({
        homeTeamId: school1.teams[0].id,
        awayTeamId: school2.teams[0].id,
        start: '2020-08-08T20:00:00',
        location: ''
      });

      expect(body.ok).toBe(false);
      expect(body.gameId).toBeUndefined();
    })

    //NOTE: abhaya this is a bug, fix this and open this test later
    xit('Adding game when my team is not home team should fail', async () => {
      const { body } = await withHeader(request(server.expressApp)
      .post('/api/games'), school1Rep.id)
      .send({
        homeTeamId: school2.teams[0].id,
        awayTeamId: school1.teams[0].id,
        start: '2020-08-08T20:00:00',
        location: 'location'
      });

      expect(body.ok).toBe(false);
      expect(body.gameId).toBeUndefined();
    })

    // (note this gameId we will be using it in remaining tests)
    
    describe('Create game', () => {
      let gameId;

      beforeAll(async () => {
        const { body }  = await withHeader(request(server.expressApp)
          .post('/api/games'), school1Rep.id)
          .send({
            homeTeamId: school1Rep.id,
            awayTeamId: school2Rep.id,
            start: '2020-08-08T01:00:00',
            location: 'location'
          });

        gameId = body.gameId;
      })

      it('game should have pending_away_team status', async () => {
        const { body }  = await withHeader(request(server.expressApp)
          .get(`/api/games/${gameId}`), school1Rep.id);

        expect(body.game).toBeDefined();
        expect(body.game.status).toBe('pending_away_team');
      })

      it('bad edit date format should fail', async () => {
        const { body } = await withHeader(request(server.expressApp)
          .post(`/api/games/${gameId}/edit`), school1Rep.id)
          .send({
            homeTeamId: school1Rep.id,
            awayTeamId: school2Rep.id,
            start: '2020-0808T01:00:00',
            location: 'location'
          });

          expect(body.ok).toBe(false);
      })

      it('accepting game by home team should fail', async () => {
        const { body } = await withHeader(request(server.expressApp)
          .post(`/api/games/${gameId}/accept`), school1Rep.id)
          
          expect(body.ok).toBe(false);
      })

      it('accepting game by away team should pass', async () => {
        const { body } = await withHeader(request(server.expressApp)
          .post(`/api/games/${gameId}/accept`), school2Rep.id)
          
          expect(body.ok).toBe(true);
      })

      it('bad edit location format should fail', async () => {
        const { body } = await withHeader(request(server.expressApp)
        .post(`/api/games/${gameId}/edit`), school1Rep.id)
        .send({
          homeTeamId: school1Rep.id,
          awayTeamId: school2Rep.id,
          start: '2020-08-08T01:00:00',
          location: ''
        });
          
          expect(body.ok).toBe(false);
      })

      it('good edit date format and locaiton succeed', async () => {
        const { body } = await withHeader(request(server.expressApp)
        .post(`/api/games/${gameId}/edit`), school1Rep.id)
        .send({
          homeTeamId: school1Rep.id,
          awayTeamId: school2Rep.id,
          start: '2020-08-08T21:00:00',
          location: 'location2'
        });
        
        expect(body.ok).toBe(true);
      })

      it('accepting by assignor', async () => {
        const { body } = await withHeader(request(server.expressApp)
          .post(`/api/games/${gameId}/accept`), assignor.id)
          
          expect(body.ok).toBe(true);
      })


      /*
      it('assignor rejects', () => {
        expect(body.ok).toBe(false);
        expect(body.gameId).toBeUndefined();
      })

      it('assignor accepting should fail', () => {
        expect(body.ok).toBe(true);
        expect(body.status).toBeDefined();
        newGameId = body.gameId;
      })*/
    })
  })
})