import request from 'supertest';
import { getServerInstance, resetDatabase } from './test-helper';


describe('Signup/Login test', () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
  });

  describe('POST /login', () => {
    it ('cannot login bad email', done => {
      const server = getServerInstance();
      const app = server.expressApp;
  
      request(app)
        .post('/api/login')
        .send({
          email: 'random@email.com',
          password:'password'
        })
        .expect(200)
        .end(function(err, res) {
          const { ok, reason } = res.body;
          expect(ok).toEqual(false);
          expect(typeof reason).toEqual('string');        
          done();
        });
    });
  
    it ('cannot login bad password', async done => {
      const server = getServerInstance();
      const app = server.expressApp;
  
      const user = await server.repository.getAdmin();
      request(app)
        .post('/api/login')
        .send({
          email: user.email,
          password: user.password + 'xxx'
        })
        .expect(200)
        .end(function(err, res) {
          expect(res.body.ok).toEqual(false);
          done();
        });
    });
  
    it ('can login', async done => {
      const server = getServerInstance();
      const app = server.expressApp;
  
      const user = await server.repository.getAdmin();
  
      request(app)
        .post('/api/login')
        .send({
          email: user.email,
          password: user.password
        })
        .expect(200)
        .end(function(err, res) {
          expect(res.body.ok).toEqual(true);
          expect(res.body.sessionId).toBeTruthy();
          done();
        });
    });
  });

  //TODO: signup
})
