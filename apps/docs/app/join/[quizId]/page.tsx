"use client"

import { EndPage } from "@/app/components/liveQuiz/Ended"
import Leaderboard from "@/app/components/liveQuiz/leaderBoard"
import { QuestionPage } from "@/app/components/liveQuiz/questionPage"
import { WaitingPage } from "@/app/components/liveQuiz/waiting"
import { EndState, useCurrentQuestionStore, useCurrentQuizStateStore, useEndStateStore, useLeaderBoardStore, useTotalPlayers, useUserSocket } from "@/store/quizstore"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

interface CurrentQuestion {
    question: string,
    options: Options[],
    totalPoints: number,
    startTime: number, 
    questionId: string
}

interface Options {
    option: string,
    index: number
}


interface LeaderBoard {
    participantId: string;
    points: number;
    name: string;
}

export default function Join({ params }: { params: Promise<{ quizId: string }> }) {

    const {currentState, setCurrentState } = useCurrentQuizStateStore()
    const { setTotalPlayers } = useTotalPlayers()
    const { setCurrentQuestion } = useCurrentQuestionStore()
    const { setLeaderBoard, setField } = useLeaderBoardStore()
    const { setEndState } = useEndStateStore()
    const {ws,setWs} = useUserSocket()
    const router = useRouter()


    useEffect(() => {

        async function main() {
            if (!localStorage.getItem("user")) {
                router.push("/")
                return
            }
            const socket = new WebSocket("ws://localhost:8000")
            setWs(socket)
            const userData = JSON.parse(localStorage.getItem("user")!) as  {participantId: any;roomId: any;roomKey: any; userName: string;}

            if (!userData) {
                toast.error("invalid request")
                router.push("/")
                return
            }
                socket.onopen = () => {
                    console.log("connected")
                    socket.send(JSON.stringify({
                        roomkey: userData.roomKey,
                        roomId: userData.roomId,
                        participantId: userData.participantId,
                        request: "join"
                    }))
                    
                }

            socket.onmessage = (data) => {
                const message = JSON.parse(data.data)
                console.log("this is the websocket message",message)
                console.log("this is the message from the websocket server", message)
                if (message.state === "WAITING") {
                    setCurrentState("WAITING")
                    setTotalPlayers(message.totalPlayers)
                } else if (message.state === "STARTED") {
                    setCurrentState("STARTED")
                    const newQuestion: CurrentQuestion = {
                        question: message.question,
                        options: message.options.map((value: Options) => {
                            return {
                                option: value.option,
                                index: value.index
                            }
                        }),
                        totalPoints: message.totalPoints,
                        startTime: message.startTime, 
                        questionId: message.questionId
                    }
                    setCurrentQuestion(newQuestion)
                } else if (message.state === "LEADERBOARD") {
                    setCurrentState("LEADERBOARD")
                    const leaderBoard: LeaderBoard[] = message.leaderBoard.map((value: LeaderBoard) => {
                        return {
                            points: value.points,
                            participantId: value.participantId,
                            name: value.name,
                        }
                    })
                    console.log("-------------leaderboard---------------")

                    console.log("this is the leaderboard", message)
                    setLeaderBoard(leaderBoard)
                    if (message.userPoints !== undefined) {
                        setField("userPoints", message.userPoints)
                    }
                    if (message.userPosition !== undefined) {
                        setField("userPosition", message.userPosition)
                    }
                    if (message.correctAns !== undefined) {
                        setField("correctAns", message.correctAns)    
                    }
                    if (message.isCorrect!== undefined) {
                        setField("isCorrect", message.isCorrect)                        
                    }
                } else if (message.state === "ENDED") {
                    setCurrentState("ENDED")
                    const endState: EndState = {
                        userPoint: message.userPoint,
                        userName: message.userName,
                        correctQuestions: message.CorrectQuestions
                    }
                    setEndState(endState)
                } else if(message.type === "error"){
                    toast.error(message.message)
                    return
                }else if (message.type === "quit"){ 
                    toast.error(message.message)
                    router.push("/")
                }
                else { 
                    toast.error(JSON.stringify(message))
                    return
                }

            }
        }
        main()
        
        return () => { 
            ws?.close()
        }
    }, [])

    return (
        <div>
              <div className="h-screen w-screen">
            {
                currentState === "WAITING" ? <WaitingPage/> :
                currentState === "LEADERBOARD" ? <Leaderboard/> : 
                currentState === "STARTED" ? <QuestionPage/> : <EndPage/>
                
            }
        </div>
        </div>
    )
}