'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');

const { notes } = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Notes API resource', function() {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Note.insertMany(notes);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });


  /* ----- GET /api/notes ----- */
  describe('GET /api/notes', function() {
    it('should return the correct number of notes', function() {
      return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
      ])
        .then(([data,res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });
    // add it block to test searchTerm
    it('should return correct search results for a searchTerm query', function() {
      // const searchTerm = 'gaga';
      const searchTerm = 'Posuere';
      const re = new RegExp(searchTerm, 'i');
      const dbPromise = Note.find({
        // title: { $regex: searchTerm, $options: 'i' }
        $or: [{ 'title': re }, { 'content': re}]
      }).sort({ updatedAt: 'desc' });
      const apiPromise = chai.request(app)
        .get(`/api/notes?searchTerm=${searchTerm}`);
      
      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(4);
          res.body.forEach(function(item, i) {
            expect(item).to.be.a('object');
            expect(item).to.include.all.keys('id', 'title', 'createdAt', 'updatedAt');
            expect(item.id).to.equal(data[i].id);
            expect(item.title).to.equal(data[i].title);
            expect(item.content).to.equal(data[i].content);
            expect(new Date(item.createdAt)).to.deep.equal(data[i].createdAt);
            expect(new Date(item.updatedAt)).to.deep.equal(data[i].updatedAt);
          });
        });
    });
    
  });


  /* ----- GET /api/notes/:id ----- */
  describe('GET /api/notes/:id', function () {
    it('should return correct note', function () {
      let data;
      // 1) First, call the database
      return Note.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
  
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'folderId', 'tags', 'createdAt', 'updatedAt');
  
          // 3) then compare database results to API response
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(res.body.folderId).to.equal(data.folderId.toString());
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  /* ----- GET /api/notes/:id ERROR 404 note doesn't exist ----- */



  /* ----- POST/CREATE /api/notes/ ----- */
  describe('POST /api/notes', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'post title test',
        'content': 'post content test',
        'folderId': '111111111111111111111100',
        'tags': ['222222222222222222222200']
      };

      let res;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'folderId', 'tags', 'createdAt', 'updatedAt');
          // 2) then call the database
          return Note.findById(res.body.id);
        })
        // 3) then compare the API response to the database results
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  /* ----- POST/CREATE /api/notes/ ERROR ----- */


  /* ----- PUT/UPDATE /api/notes/ ----- */
  describe('PUT /api/notes/:id', function() {
    it('should update notes with user edits', function() {
      const updateItem = {
        'title': 'update title test',
        'content': 'update content test',
        'folderId': '111111111111111111111100',
        'tags': ['222222222222222222222200']
      };

      let res;
      let data;
      return Note.findOne()
        .then(_data => {
          data =  _data;
          return chai
            .request(app)
            .put(`/api/notes/${data.id}`)
            .send(updateItem);
        })
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'folderId', 'tags', 'createdAt', 'updatedAt');
          return Note.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });


  /* ----- DELETE /api/notes/:id ----- */
  describe('DELETE /api/notes/:id', function() {
    it('should delete note at id', function() {
      let data;
      // 1) First, call the database
      return Note.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai
            .request(app)
            .delete(`/api/notes/${data.id}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
        })
        .then(function() {
          return chai.request(app)
            .get(`/api/notes/${data.id}`)
            .then(function(res) {
              expect(res.body.message).to.equal('Not Found');
              expect(res.body).to.have.status(404);
            });
        });
    });
  });


}); // closing for first describe block