var Piece = require("./piece");

var game = function(id){
    this.playerA = null;
    this.playerB = null;
    this.id = id;
    this.gameState = "0 players";
    this.pieces= [];
    this.turn = 'B'; //because turn() is going to change it to A at start time
    this.isValid = false;
    this.foundArray = [];
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
    this.playerA.send("{\"type\": \"Game starts player A\"}");
    this.playerB.send("{\"type\": \"Game starts player B\"}");
    this.pieces.push(new Piece(this.playerA, 4, 4));
    this.pieces.push(new Piece(this.playerA, 5, 5));
    this.pieces.push(new Piece(this.playerB, 4, 5));
    this.pieces.push(new Piece(this.playerB, 5, 4));
    this.turnFun();

}

game.prototype.turnFun = function(){
    if(this.turn ==='A'){
        this.turn = 'B';
        this.playerB.send("{\"type\": \"Turn player B\"}");
        this.playerA.send("{\"type\": \"Turn player B\"}");
    }
    else{
        this.turn = 'A';
        this.playerB.send("{\"type\": \"Turn player A\"}");
        this.playerA.send("{\"type\": \"Turn player A\"}");
    }
}

game.prototype.hasPlayer = function(ws){
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
game.prototype.find  = function(x, y){
    for(p of this.pieces){
        if(p.x===x && p.y===y){
            return p;
        }
    }
    return null;
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
                this.foundArray = this.foundArray.concat(tempFoundArray);
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
   /* var sameXPieces1 = pieces.filter(p => p.x==currPiece.x && p.y<currPiece.y);
    var sameXPieces2 = pieces.filter(p => p.x==currPiece.x && p.y>currPiece.y);

    var sameYPieces1 = pieces.filter(p => p.y==currPiece.y && p.x>currPiece.x);
    var sameYPieces2 = pieces.filter(p => p.y==currPiece.y && p.x<currPiece.x);

    var sameMainDiagonal1 = pieces.filter(p => p.x - p.y == currPiece.x - currPiece.y && p.x<currPiece.x);
    var sameMainDiagonal2 = pieces.filter(p => p.x - p.y == currPiece.x - currPiece.y && p.x>currPiece.x);

    var sameAntiDiagonal1 = pieces.filter(p => p.x + p.y == currPiece.x + currPiece.y && p.x<currPiece.x);
    var sameAntiDiagonal2 = pieces.filter(p => p.x + p.y == currPiece.x + currPiece.y && p.x>currPiece.x);
*/
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
        this.foundArray.push(currPiece);
        this.pieces = this.pieces.concat(this.foundArray);
        this.playerA.send(JSON.stringify({type: "Turn valid",flipArray: this.foundArray}));
        this.playerB.send(JSON.stringify({type: "Turn valid",flipArray: this.foundArray}));
        this.turnFun();
    }
    else{
        this.getActivePlayer().send("{\"type\": \"Turn invalid\"}");
    }
}

module.exports = game;