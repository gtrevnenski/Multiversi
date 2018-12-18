var Piece = require("./piece");
var app = require("./app");

var game = function(){
    this.playerA = null;
    this.playerB = null;
    this.gameState = "0 players";
    this.pieces= [];
    this.turn = 'B'; //because turn() is going to change it to A at start time
    this.isValid = false;
    this.foundArray = [];
}

game.prototype.endGame = function(){
    var playerAPoints = 0;
    var playerBPoints = 0;

    for(p of this.pieces){
        if(p.player == this.playerA){
            playerAPoints++;
        }
        else if(p.player == this.playerB){
            playerBPoints++;
        }
    }
    if(playerAPoints>playerBPoints){

        this.playerA.send(JSON.stringify({"type": "Player A wins"}));
        this.playerB.send(JSON.stringify({"type": "Player A wins"}));
        }
    else{
        this.playerA.send(JSON.stringify({"type": "Player B wins"}));
        this.playerB.send(JSON.stringify({"type": "Player B wins"}));
    }
    app.endGame(this);
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
    this.playerA.send(JSON.stringify({"type": "Game starts player A"}));
    this.playerB.send(JSON.stringify({"type": "Game starts player B"}));
    this.pieces.push(new Piece(this.playerA, 4, 4));
    this.pieces.push(new Piece(this.playerA, 5, 5));
    this.pieces.push(new Piece(this.playerB, 4, 5));
    this.pieces.push(new Piece(this.playerB, 5, 4));
    this.turnFun();
    this.skipTurn = false;

}

game.prototype.checkTurn = function(){
    var currPiece = new Piece(this.getActivePlayer(), 1, 1);
    for(let i=1; i<8; i++){
        for(let j=1; j<8; j++){
            currPiece.x = i;
            currPiece.y = j;
            if( this.find(i, j) == null && (this.checkInDirection(currPiece,0,1) //Y - right
                || this.checkInDirection(currPiece,0,-1) //Y - left
                || this.checkInDirection(currPiece,1,0) //X - down
                || this.checkInDirection(currPiece,-1,0) //X - up
                || this.checkInDirection(currPiece,1,1) //Diagonal - down right
                || this.checkInDirection(currPiece,-1,-1) //Diagonal - up left
                || this.checkInDirection(currPiece,-1,1) //Diagonal - up right
                || this.checkInDirection(currPiece,1,-1))) // Diagonal - down left
             {
                 this.skipTurn = false;
                 return;
             }
        }
    }
    this.skipTurn = true;
}

game.prototype.turnFun = function(){ //changes whose turn it is and sends messages to the players
    
    if(this.turn ==='A'){
        this.turn = 'B';
        this.playerA.send(JSON.stringify({"type": "Turn player B"}));
        this.playerB.send(JSON.stringify({"type": "Turn player B"}));
    }
    else{
        this.turn = 'A';
        this.playerA.send(JSON.stringify({"type": "Turn player A"}));
        this.playerB.send(JSON.stringify({"type": "Turn player A"}));
    }
    
    if(this.skipTurn){
        this.checkTurn();
        if(this.skipTurn){
            this.endGame();
        }
    }
    else{
        this.checkTurn();
        if(this.skipTurn){
            this.turnFun();
        }
    }
    


}

game.prototype.hasPlayer = function(ws){ //possibly unnecessary
    return this.playerA === ws || this.playerB === ws;
}

game.prototype.getActivePlayer = function(){
    if(this.turn==='A'){
        return this.playerA;
    }
    return this.playerB;
}
game.prototype.getInactivePlayer = function(){
    if(this.turn==='B'){
        return this.playerA;
    }
    return this.playerB;
}
game.prototype.find  = function(x, y){ //goes throught the array pieces and returns piece with same coordinates as provided or null if no such piece exists
    for(p of this.pieces){
        if(p.x===x && p.y===y){
            return p;
        }
    }
    return null;
}
game.prototype.checkInDirection = function(currPiece, deltaX, deltaY){
    var tempX =  currPiece.x + deltaX;
    var tempY =  currPiece.y + deltaY;
    var foundPiece = this.find(tempX, tempY);

    while(foundPiece!=null)
    {
        if(foundPiece.getPlayer()==this.getActivePlayer() ){
            if((foundPiece.x != (currPiece.x + deltaX)) || (foundPiece.y != (currPiece.y + deltaY))) //if the found piece is next to current piece the move is invalid
            {
                return true;
            }else return false;
        }

        tempX += deltaX;
        tempY += deltaY;
        foundPiece = this.find(tempX, tempY);
    } 
    return false;
}
game.prototype.findInDirection = function(currPiece, deltaX, deltaY){
    var tempX =  currPiece.x + deltaX;
    var tempY =  currPiece.y + deltaY;
    var foundPiece = this.find(tempX, tempY);
    var tempFoundArray = [];

    while(foundPiece!=null)
    {
        if(foundPiece.getPlayer()==this.getActivePlayer() ){
            if((foundPiece.x != (currPiece.x + deltaX)) || (foundPiece.y != (currPiece.y + deltaY))) //if the found piece is next to current piece the move is invalid
            {
                this.isValid = true;
                this.foundArray = this.foundArray.concat(tempFoundArray); //the move is valid and we've reached a piece of the active player
                break;
            }else return;
        }
        tempFoundArray.push(foundPiece);

        tempX += deltaX;
        tempY += deltaY;
        foundPiece = this.find(tempX, tempY);
    }
}

game.prototype.makeMove = function(message){
    var arr = message.split("-");
    var tx = parseInt(arr[0]);
    var ty = parseInt(arr[1]);
    var currPiece = new Piece(this.getActivePlayer(), tx, ty);
    if(this.find(currPiece.x, currPiece.y) != null){
        this.getActivePlayer().send(JSON.stringify({"type": "Turn invalid"}));
        return;
    }

    this.isValid = false;
    this.foundArray = [];

    this.findInDirection(currPiece,0,1); //Y - right
    this.findInDirection(currPiece,0,-1); //Y - left
    this.findInDirection(currPiece,1,0); //X - down
    this.findInDirection(currPiece,-1,0); //X - up
    this.findInDirection(currPiece,1,1); //Diagonal - down right
    this.findInDirection(currPiece,-1,-1); //Diagonal - up left
    this.findInDirection(currPiece,-1,1); //Diagonal - up right
    this.findInDirection(currPiece,1,-1); // Diagonal - down left
    this.foundArray.forEach(p => p.player=this.getActivePlayer());
    if(this.isValid){
        this.skipTurn = false;
        this.foundArray.push(currPiece);
        for(piece of this.foundArray){
            let tempPiece = this.find(piece.x, piece.y);
            if(tempPiece != null){
            let index = this.pieces.indexOf(tempPiece);
            this.pieces.splice(index, 1);
            }
        }
        this.pieces = this.pieces.concat(this.foundArray);
        this.playerA.send(JSON.stringify({type: "Turn valid",flipArray: this.foundArray}));
        this.playerB.send(JSON.stringify({type: "Turn valid",flipArray: this.foundArray}));
        this.turnFun();
    }
    else{
        this.getActivePlayer().send(JSON.stringify({"type": "Turn invalid"}));
    }
}

module.exports = game;