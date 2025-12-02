"use client"

import { EndPage } from "@/app/_components/livequizPage/EndPage"
import Leaderboard from "@/app/_components/livequizPage/LeaderBoard"
import { QuestionPage } from "@/app/_components/livequizPage/questionPage"
import { WaitingPage } from "@/app/_components/livequizPage/WaitingPage"
import { EndState, useCurrentQuestionStore, useCurrentQuizStateStore, useEndStateStore, useLeaderBoardStore, useTotalPlayers, useUserSocket } from "@/store/liveQuiz"
import { useSession } from "next-auth/react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
interface CurrentQuestion { 
    question: string, 
    options: Options[], 
    totalPoints: number, 
    startTime: number
}

interface Options { 
    option:string, 
    index: string
}


interface LeaderBoard { 
    participantId: string;
    points: number;
    name: string;
}

export default function Join({ params }: {params: Promise<{quizId: string}>} ) {

    const intervalRef = useRef< NodeJS.Timeout | null>(null)
    const session = useSession()
    const { currentState ,setCurrentState} = useCurrentQuizStateStore()
    const {setTotalPlayers} = useTotalPlayers()
    const { setCurrentQuestion} = useCurrentQuestionStore()
    const { setLeaderBoard } = useLeaderBoardStore()
    const { setEndState } = useEndStateStore()
    const { ws, setWs} = useUserSocket()
    const router = useRouter()


    useEffect(() => { 

        async function main() { 
            console.log("inside the useeffect")
            if (!session.data?.user.jwtToken) {
                console.log("this is the session==",session)
                toast.error("loading")
                return 
            }

            console.log("socket")
            if (ws !== null) {
                return
            }
            const socket = new WebSocket("wss://quizbackend.alignstacks.com")
            setWs(socket)
            socket.onopen = () => { 
                console.log("connected")
                console.log("jwt token", session)
                socket.send(JSON.stringify({ 
                    jwtToken: session.data?.user.jwtToken, 
                    request: "adminJoin"
                }))
                const timer = setInterval(() => { 
                    socket.send(JSON.stringify({ 
                        request: "ping"
                    }))
                }, 30 * 1000)
                intervalRef.current = timer
                
            }
            
            socket.onmessage = (data) => { 
                const message = JSON.parse(data.data)
                console.log("this is the message from the websocket server", message)
                if (message.state === "WAITING") {
                    setCurrentState("WAITING")
                    setTotalPlayers(message.totalPlayers)
                    return
                }else if (message.state === "STARTED") { 
                    setCurrentState("STARTED")
                    const newQuestion: CurrentQuestion = { 
                        question: message.question, 
                        options: message.options.map((value: Options) => { 
                            return{ 
                                option: value.option, 
                                index: value.index
                            }
                        }), 
                        totalPoints: message.totalPoints, 
                        startTime: message.startTime
                    }
                    setCurrentQuestion(newQuestion)
                    return
                }else if (message.state === "LEADERBOARD") { 
                    setCurrentState("LEADERBOARD")
                    const leaderBoard: LeaderBoard[] = message.leaderBoard.map((value: LeaderBoard) => { 
                        return{ 
                            points: value.points, 
                            participantId: value.participantId, 
                            name: value.name
                        }
                    })
                    setLeaderBoard(leaderBoard)
                    return
                }else if (message.state === "ENDED") { 
                    setCurrentState("ENDED")
                    const endState: EndState = { 
                        userPoint: message.userPoint, 
                        userName: message.userName, 
                        correctQuestions: message.CorrectQuestions
                    }
                    setEndState(endState)
                    return
                }else if(message.type === "error") { 
                    toast.error(message.message)
                    return
                }else if (message.type === "forbidden"){
                    toast.error(message.message)
                    localStorage.removeItem("roomInfo")
                    router.push("/quizes")
                    return
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
            ws == null            
        }
    },[session])

    return ( 
        <div className="h-screen w-screen">
            {
                currentState === "WAITING" ? <WaitingPage/> :
                currentState === "LEADERBOARD" ? <Leaderboard/> : 
                currentState === "STARTED" ? <QuestionPage/> : <EndPage/>
                
            }
        </div>
    )
}