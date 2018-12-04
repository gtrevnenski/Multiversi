var piece = function(player, x, y){
    this.player = player;
    this.x = x;
    this.y = y;
}

piece.prototype.setPlayer = function(player){
    this.player = player;
}

piece.prototype.getPlayer = function(){
    return this.player;
}

module.exports = piece;