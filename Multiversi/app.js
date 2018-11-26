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

var activeGames = []; // Game[]

wss.on("connection", function(ws){
	currentGame.addPlayer(ws);
		
	if(currentGame.isFull()){
		console.log("Starting game " + currentGameId);

		activeGames.push(currentGame);
		currentGame.start();

		currentGameId++;
		currentGame = new Game(currentGameId);
		console.log("Creating game " + currentGameId);
	}

	ws.on("message", function incoming(message) {
		if(message.startsWith("move")){
			//move:1-1
			for(let game of activeGames){
				if(game.hasPlayer(ws)){
					game.makeMove(message.replace("move:",""));
				}
			}
		}
	});
});
server.listen(port);
