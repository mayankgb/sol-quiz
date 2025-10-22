"use client"

import { useCurrentQuestionStore, useUserSocket } from "@/store/quizstore"
import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Card } from "@/components/ui/card"
import { Clock, Eye } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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

export function QuestionPage() {
    const { currentQuestion } = useCurrentQuestionStore()
    const [timeLeft, setTimeLeft] = useState(10)
    const [timeRemaining, setTimeRemaining] = useState(Math.floor((currentQuestion.startTime + (10 * 1000) - (new Date().getTime())) / 1000))
    const { ws } = useUserSocket()
    const router = useRouter()
    const [isSubmitted, setisSubmitted] = useState(false)

    useEffect(() => {

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 0) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }, [])
    async function handleSubmit(questionId: string, optionIndex: number) {
        try {
            if (!ws) {
                console.log("websocket is not present")
                return
            }
            if (!localStorage.getItem("user")) {
                toast.error("no quiz present")
                router.push("/")
                return
            }

            const userMetadata = JSON.parse(localStorage.getItem("user")!) as  {participantId: any;roomId: any;roomKey: any; userName: string;}
            ws.send(JSON.stringify({ 
                request: "submission", 
                index: optionIndex, 
                questionId: questionId, 
                roomKey: userMetadata.roomKey
            }))
            setisSubmitted(true)
        }catch(e) { 
            console.log(e)
            toast.error("something went wrong")
            return
        }
    }



    const getTimerColor = () => {
        if (timeLeft > 6) return "text-black"
        if (timeLeft > 3) return "text-gray-600"
        return "text-black"
    }

    return (
        <div className="h-screen w-screen">
            {isSubmitted ? (
            <div className="h-screen w-screen flex items-center justify-center">
                waiting for the result
            </div>
        ): ( 
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-3xl space-y-6">
           

                {/* Timer */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-full border border-gray-200">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <motion.span
                            key={timeLeft}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`text-2xl font-bold ${getTimerColor()}`}
                        >
                            {timeRemaining}s
                        </motion.span>
                    </div>
                </motion.div>

                {/* Question */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                >
                    <Card className="bg-white border-gray-200 p-8">
                        <h2 className="text-2xl font-semibold text-black text-center">
                            {currentQuestion.question}
                        </h2>
                        <div className="mt-4 text-center">
                            <span className="text-sm text-gray-500">
                                {currentQuestion.totalPoints} points
                            </span>
                        </div>
                    </Card>
                </motion.div>

                {/* Options */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    {currentQuestion.options.map((option, idx) => (
                        <motion.div
                            key={option.index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            className="cursor-pointer"
                            onClick={() => handleSubmit(currentQuestion.questionId, option.index)}
                            
                        >
                            <Card
                                className="bg-gray-50 border-gray-200 p-6 cursor-pointer opacity-75 hover:border-gray-300 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold border border-gray-300 bg-white text-black"
                                    >
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <p className="text-base text-black font-medium">
                                        {option.option}
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
        )}
        
        </div>
        
    )
}