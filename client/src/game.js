import React, { useEffect, useRef, useState } from "react";
import randomWords from 'random-words'
import SignatureCanvas from 'react-signature-canvas'

export default function Game(props) {
    const [view, setView] = useState(props.firstTurn)
    const [words, setWords] = useState([])
    const [selectedWord, setSelectedWord] = useState("")
    const [guess, setGuess] = useState({draw: "", word: "", currentScore: 0, addScore: 0})
    const [pen, setPen] = useState("black")
    const [score, setScore] = useState(0)
    const wordsSelection = useRef(null)
    const dificulatySelection = useRef(null)
    const selectedDificulity = useRef(null)
    const drawWord = useRef(null)
    const canvasDraw = useRef(null)
    const guessInput = useRef(null)
    const guessReaction = useRef(null)

    const setDificulity = () => {
        if(dificulatySelection.current.innerText === ""){return}
        wordsSelection.current.hidden = false
        dificulatySelection.current.hidden = true

        if(selectedDificulity.current.value === '1'){
            setWords(randomWords({exactly: 3, maxLength: 3}))
        }
        else if(selectedDificulity.current.value === '3'){
            setWords(randomWords({exactly: 3, maxLength: 6, minLength: 4}))
        }
        else if(selectedDificulity.current.value === '5'){
            setWords(randomWords({exactly: 3, maxLength: 10, minLength: 7}))
        }
    }

    const setWord = () => {
        wordsSelection.current.hidden = true
        drawWord.current.hidden = false
    }

    const sendGuess = () => {
        props.connection.emit("newGuess", ({partner: props.partner.id, draw: canvasDraw.current.toDataURL(), word: selectedWord, currentScore: score, addScore: Number(selectedDificulity.current.value)}))
        setView("waiting")
    }

    const checkGuess = () => {
        if(guessInput.current.value === guess.word){
            guessReaction.current.src = "https://media4.giphy.com/media/3o7abKhOpu0NwenH3O/200w.webp?cid=ecf05e472txao2lcug1htbz0gpl0ixdxcree22zmifrkyc4b&rid=200w.webp&ct=g"
            setTimeout(()=>{
                setScore(guess.addScore + guess.currentScore)
                setView("my turn")
            },2500)
        }
        else {
            guessReaction.current.src = 'https://media2.giphy.com/media/m8eIbBdkJK7Go/giphy.gif?cid=ecf05e47wtk91t8dgt5uafbuyy3h41cfjqw85mcnm2jx8lt6&rid=giphy.gif&ct=g'
            setTimeout(()=>{
                guessReaction.current.src = guess.draw
            },2500)
            return
        }
    }

    useEffect(()=>{
        props.connection.on("guess", (details)=>{
            setScore(details.currentScore)
            setGuess(details)
            setView("guessing")
        })
    },[])
    
    if(view === "my turn"){
        return <div style={{textAlign: "center"}}>
            <button style={{float: "right", fontSize: "250%"}} onClick={props.quitGame}>Quit game</button>
            <div className="score">Game score: {score}</div>
            <div ref={dificulatySelection}>
            <h1 style={{marginBottom: "10%"}}>Select difficulty</h1>
            <select className="selectPlayer" style={{fontSize: "250%", marginRight: "3%", width: "15%"}} ref={selectedDificulity}>
                <option></option>
                <option value={'1'}>Easy</option>
                <option value={'3'}>Medium</option>
                <option value={'5'}>Hard</option>
            </select>
            <button style={{fontSize: "230%"}} onClick={setDificulity}>Continue</button>
            </div>
            <div ref={wordsSelection} hidden={true}>
                <h1>Select word</h1>
                {words.map((word)=>{
                    return <button style={{fontSize: "300%", padding: "1%", margin: "1%", borderRadius: "20px"}} onClick={()=>{setSelectedWord(word)}}>{word}</button>
                })}
                <br /><button style={{marginTop: "5%", fontSize: "200%"}} onClick={setWord}>Continue</button>
            </div>
            <div style={{textAlign: "center"}} ref={drawWord} hidden={true}>
                <h1>Draw !!!</h1>
                <div style={{border: "2px solid cornflowerblue", borderRadius: "4px", height: "300px", width: "650px", margin: "auto", backgroundColor: "white"}}>
                    <SignatureCanvas ref={canvasDraw} penColor={pen} canvasProps={{height: 300, width: 650}} />
                </div>
                <input style={{width: "5%"}} type={"color"} onChange={(e)=>{setPen(e.target.value)}}></input>
                    <button style={{margin: "1%", fontSize: "150%"}} onClick={()=>{canvasDraw.current.clear()}}>clear</button>
                    <button style={{fontSize: "150%"}} onClick={sendGuess}>send</button>
            </div>
        </div>
    }
    else if(view === "waiting") {
        return <div style={{textAlign: "center"}}>
            <button style={{float: "right", fontSize: "250%"}} onClick={props.quitGame}>Quit game</button>
            <div className="score">Game score: {score}</div>
            <img style={{borderRadius: "5px", marginTop: "4%"}} alt="waiting" src="https://media0.giphy.com/media/tXL4FHPSnVJ0A/giphy.gif?cid=ecf05e477ybpwhecrfbwggytf47xe2gnnq2ex98rjnwn88sm&rid=giphy.gif&ct=g"></img>
            <div style={{marginBottom: "5%", fontSize: "200%", color: "cornflowerblue"}}>Waiting for {props.partner.username} to play</div>
        </div>
    }
    else if(view === "guessing"){
        return <div style={{textAlign: "center"}}>
            <button style={{float: "right", fontSize: "250%"}} onClick={props.quitGame}>Quit game</button>
            <div className="score">Game score: {score}</div>
            <h1>Guess the word</h1>
            <img ref={guessReaction} style={{border: "2px solid cornflowerblue", borderRadius: "4px", height: "300px", width: "650px", backgroundColor: "white"}} alt="guess" src={guess.draw}></img>
            <br /><input style={{color: "cornflowerblue", marginTop: "1%", marginRight: "1%", fontSize: "150%", border: "2px solid cornflowerblue", borderRadius: "4px"}} ref={guessInput} placeholder="What is your guess" type={"text"}></input>
            <button style={{fontSize: "150%"}} onClick={checkGuess}>Send</button>
            <div hidden={true}>wrong</div>
        </div>
    }
}