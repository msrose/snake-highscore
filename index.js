var express = require('express');
var mongo = require('mongodb').MongoClient;
var config = require('./config.json');
var bodyParser = require('body-parser');

var prod = process.argv[2] === "--prod";

var port = prod ? process.env.PORT : config.port;
var apiKey = prod ? process.env.API_KEY : config.apiKey;
var mongoUrl = prod ? process.env.MONGO_URL : config.mongoUrl;

var app = express();
var db;

mongo.connect(mongoUrl, function(err, database) {
  db = database;
  start();
});

app.use(function(req, res, next) {
  if(req.headers.authorization !== config.apiKey) {
    return res.status(401).send({ message: 'No api key!' });
  }
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/highscores', function(req, res) {
  db.collection('userScores').find().toArray(function(err, docs) {
    if(err) {
      res.status(500).send({ 'message': 'There was an error!' });
    }
    res.send({ highscores: docs });
  });
});

app.post('/highscores', function(req, res) {
  console.log(req.body);
  var data = {
    name: req.body.name,
    score: parseInt(req.body.score),
    date: new Date().toString()
  };

  if(!data.name || isNaN(data.score) || data.score < 0) {
    return res.status(400).send({ 'message': 'Bad request' });
  }

  db.collection('userScores').insert(data, function(err, result) {
    if(err) {
      return res.status(500).send({ 'message': 'There was some error entering database info!' });
    }
    res.send({ 'message': 'Successfully added highscore!' });
  });
});

function start() {
  app.listen(port);
  console.log('Listening on port', port);
}

