var piece = function(player, x, y){
    this.player = player;
    this.x = x;
    this.y = y;
}

var piece = function(message, player){
    var arr = message.split("-");
    this.x = parseInt(arr[0]);
    this.y = parseInt(arr[1]);
    this.player = player;
}

piece.prototype.setPlayer = function(player){
    this.player = player;
}

piece.prototype.getPlayer = function(){
    return this.player;
}

module.exports(piece) = piece;