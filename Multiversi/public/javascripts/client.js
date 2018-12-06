var clientSocket = new WebSocket("ws://145.94.159.105:3000");


var player;
var currTurn;

clientSocket.onopen = function(){
    
}

clientSocket.onmessage = function (event) {
    console.log(event);
    let incomingMsg = JSON.parse(event.data);
    if(incomingMsg.type.startsWith("Game starts player ")){
        player = incomingMsg.type.split("player ")[1];
        $("#square4-4").addClass("piece isWhite");
        $("#square5-5").addClass("piece isWhite");
        $("#square5-4").addClass("piece isBlack");
        $("#square4-5").addClass("piece isBlack");
        $(".white-count-text").text("x2");
        $(".black-count-text").text("x2");
        $("#gameMsg").text("Game has started. You are " + ((player=="A")?"White":"Black"));
    }
    if(incomingMsg.type.startsWith("Turn player ")){
        turn = incomingMsg.type.split("player ")[1];
        $("#gameTurn").text(((turn=="A")?"White's":"Black's") + " turn")
    }
    if(incomingMsg.type == "Turn valid"){
        var moveSound = $("#sound")[0];
        moveSound.play();
        for (let piece of incomingMsg.flipArray){
            let square = $("#square" + piece.x + "-" +piece.y);
            if(turn == "A"){
                if(square.hasClass("isBlack")){
                    square.removeClass("isBlack blackAnim").addClass("isWhite whiteAnim");
                }
                else{
                    square.addClass("piece isWhite");
                }
            }
            else{
                if(square.hasClass("isWhite")){
                    square.removeClass("isWhite whiteAnim").addClass("isBlack blackAnim");
                 }
                 else{
                    square.addClass("piece isBlack");
                 }          
              }
              $(".white-count-text").text("x" + ($(".isWhite").length));
              $(".black-count-text").text("x" + ($(".isBlack").length));
        }
    }
    if(incomingMsg.type.endsWith("wins")){
        var player = incomingMsg.type.split(" ")[1];
        if(player == "A"){
            $("#gameMsg").text("White player wins");
        }
        if(player == "B"){
            $("#gameMsg").text("Black player wins");
        } 
    }

    console.log(incomingMsg);
}
function clickEvent(piece){
    var id = piece.id.replace("square","");
    clientSocket.send("move:" + id);
}