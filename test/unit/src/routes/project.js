const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();

describe('Project routes', function() {
  let app;
  let server;
  app = require('../../../../src');

  server = app.server;

  context('GET /project', function() {
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


  context('GET /projects/new', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .get('/projects/new')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('GET /projects/:id', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .get('/projects/:id')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('POST /projects', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .post('/projects')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('GET /projects/:id/edit', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .get('/projects/:id/edit')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('PUT /projects/:id', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .put('/projects/:id')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('DELETE /projects/:id', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .delete('/users/abcd')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

});
