import request from 'supertest';
import { getServerInstance, seedGameData, resetDatabase, withHeader } from './test-helper';
import { Server } from '../src/server';
import Team from '../src/team';
import User from '../src/user';
import School from '../src/school';
import { GameStatus, TeamKind } from '../src/enums';


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
      homeRep = homeTeam.schoolReps[0];
      awayRep = awayTeam.schoolReps[1];
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
      const { body } = await withHeader(request(server.expressApp)
        .get('/api/games'), homeRep.id)
        .expect(200);

      expect(body.ok).toBe(true);
      expect(body.games.length).toBe(0);        
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

    //Adding game with nonexisting homeTeamId should fail
    //Adding game with nonexisting awayTeamId should fail
    //Adding game with bad date format should fail
    //Adding game with empty location should fail
    //Adding game when my team is not home team should fail
    //Adding game with good date format should succeed (note this gameId we will be using it in remaining tests)
    //game should have pending_home status
    //accepting game by home team should fail
    //accepting game by away team should pass
    //accepting game by away team again should pass
    //bad edit date format should fail
    //bad edit location format should fail
    //good edit date format and locaiton succeed
    //accepting by assignor
    //assignor rejects
    //assignor accepting should fail
  })
})