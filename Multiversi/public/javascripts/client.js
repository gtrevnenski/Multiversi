var clientSocket = new WebSocket("ws://localhost:3000");

clientSocket.onopen = function(){
    
}

clientSocket.onmessage = function (event) {
    console.log(event);
    let incomingMsg = JSON.parse(event.data);
  //  if(incomingMsg.type.split
    console.log(incomingMsg);
}