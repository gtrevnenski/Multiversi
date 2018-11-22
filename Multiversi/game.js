var game = function(id){
    this.playerA = null;
    this.playerB = null;
    this.id = id;
    this.gameState = "0 players";
    this.pieces= null;
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

game.prototype.isFull = function(){
    if(this.gameState==="2 players"){
        return true;
    }
    return false;
}

module.exports = game;