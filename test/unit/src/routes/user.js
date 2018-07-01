const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();

describe('/', function() {
  //let dbStub;
  let app;
  let server;

  // dbStub = {
  //     run: function() {
  //       return Promise.resolve({
  //         stmt: {
  //           lastID: 1349
  //         }
  //       });
  //     }
  //   };
  // dbStub['@global'] = true;

  app = require('../../../../src');

  server = app.server;


  context('GET /', function() {
    it('should return 200 OK', function(done) {
      chai.request(server)
        .get('/')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });


  context('GET /register', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .get('/register')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('POST /register', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .post('/register')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('GET /login', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .get('/login')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('POST /login', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .post('/login')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('GET /logout', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .get('/logout')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('GET /users', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .get('/users')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('GET /users/:id', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .get('/users/abcd')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('GET /random-url', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .get('/reset')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.contain('Page could not be found!');
          done(err);
        });
    });
  });
});
