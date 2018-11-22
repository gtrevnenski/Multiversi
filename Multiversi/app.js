var express = require('express');
var http = require('http');
var websocketModule = require('ws');
var Game = require('./game');


var indexRouter = require('./routes/index');

var port = process.argv[2];
var app = express();

app.use(express.static(__dirname + "/public"));

app.get("/play", indexRouter);
app.get("/splash", indexRouter);

var server = http.createServer(app);
const wss = new websocketModule.Server({ server });
var currentGame = new Game(0);
var currentGameId = 0;

wss.on("connection", function(ws){
  if(currentGame.isFull()){
    currentGameId++;
    currentGame = new Game(currentGameId);
    console.log("Creating game " + currentGameId);
  }
  currentGame.addPlayer(ws);
});
server.listen(port);
