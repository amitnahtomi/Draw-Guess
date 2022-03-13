const express = require('express')
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
    cors: {
      origin: '*',
    }
  });

app.use(express.static(__dirname + "../client/build"))

  const users = []

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
        io.to(player.id).emit("sendGameReq", {id: player.fromId, username: player.fromUsername})
    })

    socket.on("acceptInvitation", (details)=>{
        io.to(details.from).emit("startGame")
        io.to(details.to).emit("startGame")
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