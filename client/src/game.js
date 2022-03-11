import React, { useEffect, useRef, useState } from "react";
import randomWords from 'random-words'
import SignatureCanvas from 'react-signature-canvas'

export default function Game(props) {
    const [view, setView] = useState(props.firstTurn)
    const [words, setWords] = useState([])
    const [selectedWord, setSelectedWord] = useState("")
    const [guess, setGuess] = useState({draw: "", word: ""})
    const [pen, setPen] = useState("black")
    const wordsSelection = useRef(null)
    const dificulatySelection = useRef(null)
    const selectedDificulity = useRef(null)
    const drawWord = useRef(null)
    const canvasDraw = useRef(null)
    const guessInput = useRef(null)
    const guessReaction = useRef(null)

    const setDificulity = () => {
        wordsSelection.current.hidden = false
        dificulatySelection.current.hidden = true

        if(selectedDificulity.current.value === "easy"){
            setWords(randomWords({exactly: 3, maxLength: 3}))
        }
        else if(selectedDificulity.current.value === "medium"){
            setWords(randomWords({exactly: 3, maxLength: 6, minLength: 4}))
        }
        else if(selectedDificulity.current.value === "hard"){
            setWords(randomWords({exactly: 3, maxLength: 10, minLength: 7}))
        }
    }

    const setWord = () => {
        wordsSelection.current.hidden = true
        drawWord.current.hidden = false
    }

    const sendGuess = () => {
        props.connection.emit("newGuess", ({partner: props.partner.id, draw: canvasDraw.current.toDataURL(), word: selectedWord}))
        setView("waiting")
    }

    const checkGuess = () => {
        if(guessInput.current.value === guess.word){
            setView("my turn")
        }
        else {
            guessReaction.current.hidden = false
            setTimeout(()=>{
                guessReaction.current.hidden = true
            },1500)
            return
        }
    }

    useEffect(()=>{
        props.connection.on("guess", (details)=>{
            setGuess(details)
            setView("guessing")
        })
    },[])

    if(view === "my turn"){
        return <div>
            <div ref={dificulatySelection}>
            <h1>Select game dificulaty</h1>
            <select ref={selectedDificulity}>
                <option value={"easy"}>Easy</option>
                <option value={"medium"}>Medium</option>
                <option value={"hard"}>Hard</option>
            </select>
            <button onClick={setDificulity}>Continue</button>
            </div>
            <div ref={wordsSelection} hidden={true}>
                <h1>Select word</h1>
                {words.map((word)=>{
                    return <button onClick={()=>{setSelectedWord(word)}}>{word}</button>
                })}
                <button onClick={setWord}>Continue</button>
            </div>
            <div ref={drawWord} hidden={true}>
                <div style={{border: "2px solid black"}}>
                    <SignatureCanvas ref={canvasDraw} penColor={pen} canvasProps={{height: 500, width: 500}} />
                </div>
                <input type={"color"} onChange={(e)=>{setPen(e.target.value)}}></input>
                    <button onClick={()=>{canvasDraw.current.clear()}}>clear</button>
                    <button onClick={sendGuess}>send</button>
            </div>
            <button onClick={props.quitGame}>quit game</button>
        </div>
    }
    else if(view === "waiting") {
        return <div>
            <div>waiting</div>
            <button onClick={props.quitGame}>quit game</button>
        </div>
    }
    else if(view === "guessing"){
        return <div>
            <img style={{border: "2px solid black"}} alt="shit" src={guess.draw}></img>
            <input ref={guessInput} placeholder="What is your guess" type={"text"}></input>
            <button onClick={checkGuess}>send</button>
            <div ref={guessReaction} hidden={true}>wrong</div>
            <button onClick={props.quitGame}>quit game</button>
        </div>
    }
}