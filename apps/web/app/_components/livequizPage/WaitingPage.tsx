"use client"

import { useTotalPlayers, useUserSocket } from "@/store/liveQuiz"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users } from "lucide-react"

export function WaitingPage() { 
    const { totalPlayers } = useTotalPlayers()
    const [playerCount, setPlayerCount] = useState(0)
    const {ws} = useUserSocket()
    const [roomInfo, setRoomInfo] = useState({ 
        id: "", 
        roomKey: 12345
    })

    // // Dummy data - simulating players joining
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setPlayerCount(prev => {
    //             const newCount = prev + Math.floor(Math.random() * 3)
    //             return newCount > 15 ? 15 : newCount
    //         })
    //     }, 2000)

    //     return () => clearInterval(interval)
    // }, [])

    useEffect(() => {
        const roomData = JSON.parse(localStorage.getItem("roomInfo")!) as { roomKey: number, quizId: string}
        setRoomInfo((prev) => { 
            return{ 
                ...prev, 
                roomKey: roomData.roomKey
            }
        })
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                console.log('Starting quiz...')
                console.log(ws)
                ws?.send(JSON.stringify({ 
                    request: "next"
                }))
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [ws])

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-between p-8">
            {/* Top Section - Join Instructions */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center pt-16"
            >
                <p className="text-sm text-gray-500 mb-2">Join at</p>
                <h1 className="text-2xl font-semibold text-black mb-4">
                    quiz.alignstacks.com
                </h1>
                
                <div className="inline-block px-6 py-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Room Key</p>
                    <p className="text-3xl font-bold text-black tracking-wider">
                        {roomInfo.roomKey}
                    </p>
                </div>
            </motion.div>

            {/* Center Section - Player Count */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-col items-center gap-6"
            >
                <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-600" />
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={playerCount}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-2xl font-semibold text-black"
                        >
                            {totalPlayers}
                        </motion.span>
                    </AnimatePresence>
                    <span className="text-gray-600">
                        {(totalPlayers || playerCount) === 1 ? 'player' : 'players'}
                    </span>
                </div>

                <p className="text-sm text-gray-500">
                    Waiting for players...
                </p>
            </motion.div>

            {/* Bottom Section - Start Instructions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-center pb-16"
            >
                <motion.div
                    animate={{ 
                        opacity: [0.7, 1, 0.7],
                    }}
                    transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-gray-200"
                    style={{ backgroundColor: '#FBF8FF' }}
                >
                    <kbd className="px-2 py-1 text-xs font-semibold text-black bg-white rounded border border-gray-300">
                        ENTER
                    </kbd>
                    <span className="text-sm text-black">
                        Press Enter to start the quiz
                    </span>
                </motion.div>
            </motion.div>
        </div>
    )
}