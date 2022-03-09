import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const connection = io("http://localhost:4000")

export default function App() {
  const [view, setView] = useState("welcome")
  const [user, setUser] = useState({id: connection.id, username: ''});
  const [usersList, setUsersList] = useState([]);
  const [gameInvitation, setGameInvitation] = useState(true)
  const [partner, setPartner] = useState({username: "", id: ""})
  const username = useRef(null)
  const selectPlayer = useRef(null)

  const setUserInfo = () => {
    setUser({id: user.id, username: username.current.value});
    if(!connection.active) {
      connection.connect();
    }
    connection.emit("user", {id: connection.id, username: username.current.value})
    setView("select player")
  }

  const sendGameInvitation = () => {
      console.log(user);
    connection.emit("gameRequest", {id: selectPlayer.current.value, username: selectPlayer.current.innerText, fromId: user.id, fromUsername: user.username})
    setPartner({id: selectPlayer.current.value, username: selectPlayer.current.innerText})
  }

  const exceptGameInvitation = () => {
      connection.emit("acceptInvitation", {from: user, to: partner})
      setGameInvitation(false)
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
        console.log("start");
        setView("game")
    })

  },[])

  if(view === "welcome"){
      return <div>
      <input type={"text"} ref={username} placeholder={"Select your user name"}></input>
      <button onClick={setUserInfo}>Log in</button>
      <div hidden={gameInvitation}>
          <div>you got a game invitation</div>
          <button onClick={exceptGameInvitation}>except invitation</button>
      </div>
      </div>
  }
  else if(view === "select player") {
    return <div>
    <select ref={selectPlayer}>
      {usersList.map((u) => {
        if(u.username !== user.username){
          return <option value={u.id}>{u.username}</option>
        }
      })}
    </select>
    <button onClick={sendGameInvitation}>send invitation</button>
    <div hidden={gameInvitation}>
          <div>you got a game invitation</div>
          <button onClick={exceptGameInvitation}>except invitation</button>
      </div>
    </div>
  }
  else if(view === "game"){
      return <div>game</div>
  }
}