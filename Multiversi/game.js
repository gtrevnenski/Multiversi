var game = function(id){
    this.playerA = null;
    this.playerB = null;
    this.id = id;
    this.gameState = "0 players";
    this.pieces= null;
    this.turn = 'B'; //because turn() is going to change it to A at start time
}

game.prototype.addPlayer = function(websocket){
    if(this.gameState==="0 players"){
        this.playerA = websocket;
        this.gameState = "1 player";
        console.log("Player A connected");

    }
    else{
        this.playerB = websocket;
        this.gameState = "2 players";
        console.log("Player B connected");
    }
}

game.prototype.getPlayer = function(i){
    return i == 'A'? this.playerA : this.playerB;
}

game.prototype.isFull = function(){
    if(this.gameState==="2 players"){
        return true;
    }
    return false;
}

game.prototype.start = function(){
    this.playerA.send("Game starts player A\n");
    this.playerB.send("Game starts player B\n");
    this.turnFun();

}

game.prototype.turnFun = function(){
    if(this.turn ==='A'){
        turn = 'B';
        this.playerB.send("Turn player B\n");
        this.playerA.send("Turn player B\n");
    }
    else{
        turn = 'A';
        this.playerB.send("Turn player A\n");
        this.playerA.send("Turn player A\n");
    }
}

game.prototype.hasPlayer = function(ws){
    return this.playerA === ws || this.playerB === ws;
}

game.prototype.makeMove = function(message){

}
module.exports = game;