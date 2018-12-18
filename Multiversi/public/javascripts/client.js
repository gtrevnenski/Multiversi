var gameModule = function(socketURL){
    var clientSocket = new WebSocket(socketURL);

    var player;
    var currTurn;

    clientSocket.onopen = function(){
        console.log("Connected to the server");
    }

    //When the server sends the player a message
    clientSocket.onmessage = function (event) {
        //console.log(event);
        let incomingMsg = JSON.parse(event.data);

        //Received after both players have connected
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

        //Received when the turn is changed
        if(incomingMsg.type.startsWith("Turn player ")){
            turn = incomingMsg.type.split("player ")[1];
            $("#gameTurn").text(((turn=="A")?"White's":"Black's") + " turn")
        }

        //Received after a player makes a move and it is verified by the server
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

        //Received when one player wins
        if(incomingMsg.type.endsWith("wins")){
            var player = incomingMsg.type.split(" ")[1];
            if(player == "A"){
                $("#gameMsg").text("White player wins");
            }
            if(player == "B"){
                $("#gameMsg").text("Black player wins");
            } 
            $("#gameTurn").text("");
            $("#backLink").text("Back");
        }

        //Received when the other player disconnects and you automatically win
        if(incomingMsg.type.endsWith("win.")){
            $("#gameTurn").text("");
            $("#gameMsg").text(incomingMsg.type);
            $("#backLink").text("Back");
        }
        console.log(incomingMsg);
    }
    
    function getPlayer(){
        return player;
    }

    function send(message){
        clientSocket.send(message);
    }

    return {
        getPlayer: getPlayer,
        send: send
    }
}

var game = new gameModule("ws://145.94.177.153:3000/");

function clickEvent(piece){
    var id = piece.id.replace("square","");
    game.send("move:" + id);
}

function toggleFS(btn){
    document.getElementsByTagName("table")[0].requestFullscreen();
}