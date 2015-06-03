var express = require('express');
var mongo = require('mongodb').MongoClient;
var bodyParser = require('body-parser');

var prod = process.argv[2] === "--prod";

var config = {};

if(!prod) {
  config = require('./config.json');
} else {
  config.port = process.env.PORT;
  config.apiKey = process.env.API_KEY;
  config.mongoUrl = process.env.MONGO_URL;
}

var db;

mongo.connect(config.mongoUrl, function(err, database) {
  if(err) {
    return console.log("Could not connect to mongo:", err);
  }
  db = database;
  start();
});

function start() {
  var app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static('static'));

  app.get('/highscores', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var query = { $query: {}, $orderby: { score: -1 } };
    var limit = req.query.limit || 25;

    db.collection('userScores').find(query).limit(limit).toArray(function(err, docs) {
      if(err) {
        console.log('Error querying from database:', err);
        return res.status(500).send({ 'message': 'Error retrieving data!' });
      }
      res.send({ highscores: docs });
    });
  });

  app.post('/highscores', function(req, res) {
    if(req.headers.authorization !== config.apiKey) {
      return res.status(401).send({ message: 'No api key!' });
    }

    var data = {
      name: req.body.name,
      score: parseInt(req.body.score),
      date: new Date().toString()
    };

    if(!data.name || isNaN(data.score) || data.score < 0) {
      return res.status(400).send({ 'message': 'Bad request!' });
    }

    db.collection('userScores').insert(data, function(err, result) {
      if(err) {
        console.log('Error writing to database:', err);
        return res.status(500).send({ 'message': 'Error entering highscore!' });
      }
      res.send({ 'message': 'Successfully added highscore!' });
    });
  });

  app.listen(config.port);
  console.log('Listening on port', config.port);
}

