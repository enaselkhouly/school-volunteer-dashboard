const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();

describe('Task routes', function() {
  let app;
  let server;
  app = require('../../../../src');

  server = app.server;

  context('GET /projects/:id/tasks', function() {
    it('should return 200 OK', function(done) {
      chai.request(server)
        .get('/projects/:id/tasks')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });


  context('GET /projects/:id/tasks/new', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .get('/projects/:id/tasks/new')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('GET /projects/:id/tasks/:taskId', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .get('/projects/:id/tasks/:taskId')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('POST /projects/:id/tasks', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .post('/projects/:id/tasks')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('GET /projects/:id/tasks/:taskId/edit', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .get('/projects/:id/tasks/:taskId/edit')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('PUT /projects/:id/tasks/:taskId', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .put('/projects/:id/tasks/:taskId')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

  context('DELETE /projects/:id/tasks/:id', () => {
    it('should return 200 OK', (done) => {
      chai.request(server)
        .delete('/projects/:id/tasks/:taskId')
        .end(function(err, res) {
          res.should.have.status(200);
          res.text.should.not.contain('Page could not be found!');
          done(err);
        });
    });
  });

});
