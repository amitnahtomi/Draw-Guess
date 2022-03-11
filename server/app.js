const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
    cors: {
      origin: '*',
    }
  });

  const users = []

  function getId(username) {
      for(let i = 0; i < users.length; i++){
          if(users[i].username === username){
              return users[i].id
          }
      }
      return false
  }

io.on("connection", (socket) => {
    socket.on("user", (user)=>{
        users.push(user)
        io.emit("userUpdate", users);
    })

    socket.on("wrong", (players)=>{
        io.to(players.id).emit("gameOver")
        io.to(players.partnerId).emit("gameOver")
    })

    socket.on("newGuess", (details)=>{
        io.to(details.partner).emit("guess", {draw: details.draw, word: details.word, currentScore: details.currentScore, addScore: details.addScore})
    })

    socket.on("gameRequest", (player)=>{
        io.to(player.id).emit("sendGameReq", {id: getId(player.fromUsername), username: player.fromUsername})
    })

    socket.on("acceptInvitation", (details)=>{
        io.to(getId(details.from.username)).emit("startGame")
        io.to(getId(details.to.username)).emit("startGame")
    })

    socket.on("disconnect", () => {
        for(let i = 0; i < users.length; i++){
            if(users[i].id === socket.id){
                users.splice(i, 1);
                break;
            }
        }
        io.emit("userUpdate", users);
    })
});

http.listen(4000, function () {
    console.log("listening on port 4000");
  });