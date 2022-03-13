import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Game from "./game";
import './App.css'

const connection = io("/")
//const connection = io("http://localhost:4000")

export default function App() {
  const [view, setView] = useState("welcome")
  const [user, setUser] = useState({id: connection.id, username: ''});
  const [usersList, setUsersList] = useState([]);
  const [gameInvitation, setGameInvitation] = useState(true)
  const [partner, setPartner] = useState({username: "", id: ""})
  const [firstTurn, setFirstTurn] = useState("")
  const username = useRef(null)
  const selectPlayer = useRef(null)

  const setUserInfo = async () => {
    if(username.current.value === ""){return}
    setUser({id: user.id, username: username.current.value});
    connection.emit("user", {id: connection.id, username: username.current.value})
    setView("select player")
  }

  const sendGameInvitation = () => {
    if(selectPlayer.current.value === ""){return}
    connection.emit("gameRequest", {id: selectPlayer.current.value, username: selectPlayer.current.innerText, fromId: connection.id, fromUsername: user.username})
    setPartner({id: selectPlayer.current.value, username: selectPlayer.current.innerText})
    setFirstTurn("my turn")
  }

  const acceptGameInvitation = () => {
      connection.emit("acceptInvitation", {from: connection.id, to: partner.id})
      setFirstTurn("waiting")
      setGameInvitation(false)
  }

  const declineGameInvitation = () => {
    connection.emit("wrong", {id: connection.id, partnerId: partner.id})
  }

  useEffect(()=>{ 
    
    connection.on("userUpdate", (updatedUsersList)=>{ 
      setUsersList(updatedUsersList);
    })

    connection.on("sendGameReq", (player)=>{
      setPartner(player)
      setGameInvitation(false)
    })

    connection.on("startGame", ()=>{
        setView("game")
    })

    connection.on("gameOver", ()=>{
      setView("select player")
      setGameInvitation(true)
    })

  },[])

  if(view === "welcome"){
      return <div style={{textAlign: "center", marginTop: "15%"}}>
      <h1>Draw & Guess</h1>
      <h4>Before we start, please select your username. Try to be creative.</h4>
      <input className="username" type={"text"} ref={username} placeholder={"Select your user name"}></input>
      <button className="login" onClick={setUserInfo}>Log in</button>
      </div>
  }
  else if(view === "select player") {
    return <div style={{textAlign: "center", marginTop: "15%"}}>
    <h1>Choose a player to play with</h1>
    <select className="selectPlayer" ref={selectPlayer}>
      {usersList.sort(sorting).map((u) => {
        if(u.username !== user.username){
          return <option value={u.id}>{u.username}</option>
        }
      })}
    </select>
    <br /><button style={{fontSize: "180%", marginTop: "13px"}} onClick={sendGameInvitation}>send invitation</button>
    <div className="gameInvitation" hidden={gameInvitation}>
          <div style={{color: "cornflowerblue", fontSize: "130%", marginBottom: "4px"}}>You got a game invitation from {partner.username}</div>
          <button style={{marginRight: "4px", marginBottom: "4px"}} onClick={acceptGameInvitation}>accept invitation</button>
          <button onClick={declineGameInvitation}>decline invitation</button>
      </div>
    </div>
  }
  else if(view === "game"){
      return <Game connection={connection} firstTurn={firstTurn} partner={partner} quitGame={declineGameInvitation} />
  }
}

function sorting(a, b) {
  let fa = a.username
  let fb = b.username

  if (fa < fb) {
      return -1;
  }
  if (fa > fb) {
      return 1;
  }
  return 0;
}