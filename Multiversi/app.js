var express = require('express');
var http = require('http');
var websocketModule = require('ws');
var cookies = require('cookie-parser')
var sessions = require('express-session')
var credentials = require('./credentials');

var Game = require('./game');

var port = process.argv[2];
var app = express();

app.use(express.static(__dirname + "/public"));

app.use(cookies(credentials.cookieSecret));
app.use(sessions(credentials.cookieSecret));

app.set('view engine', 'ejs')
app.get("/play", function(req, res){
	var session = req.session;

	if(session.visits){
		session.visits++;
	}else{
		session.visits = 1;
	}

	res.sendFile("game.html", {root: "./public"});
});
app.get("/", function(req, res){
	var session = req.session;

	if(!session.visits){
		session.visits = 0;
	}

	res.render('splash.ejs', {playersOnline: activeGames.length*2, gamesPlayed: gamesPlayed, gamesPlayedByYou: session.visits});
});

var server = http.createServer(app);
const wss = new websocketModule.Server({ server });
var currentGame = new Game(0);
var currentGameId = 0;
var gamesPlayed=0;
	
var activeGames = []; 

wss.on("connection", function(ws){
	currentGame.addPlayer(ws);
		
	if(currentGame.isFull()){
		console.log("Starting game " + currentGameId);

		activeGames.push(currentGame);
		currentGame.start();

		currentGameId++;
		currentGame = new Game();
		console.log("Creating game " + currentGameId);
	}
																	// close connection at the end
	ws.on("message", function incoming(message) {
		if(message.startsWith("move")){
			//move:1-1
			for(let game of activeGames){
				if(game.hasPlayer(ws) && game.getActivePlayer() == ws){
					game.makeMove(message.replace("move:",""));
				}
			}
		}
	});
	ws.on("close", function incoming(code){
		if(code=="1001"){
			for(let game of activeGames){
				if(game.hasPlayer(ws)){
					if(ws==game.playerA){
						game.playerB.send(JSON.stringify({"type": "Opponent disconnected. You win."}));
						endGame(game);
					}
					else{
						game.playerA.send(JSON.stringify({"type": "Opponent disconnected. You win."}));
						endGame(game);			
						}
				}
			}
		}
	});
});
function endGame(game){
	var index = activeGames.indexOf(game);
	activeGames.splice(index, 1);
	currentGameId--;
	gamesPlayed++;
};

server.listen(port);
module.exports.endGame = endGame;