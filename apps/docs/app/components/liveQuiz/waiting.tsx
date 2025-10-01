"use client"

import { useTotalPlayers } from "@/store/quizstore"
import {  useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function WaitingPage() { 
    const { totalPlayers } = useTotalPlayers()
    const [playerCount, setPlayerCount] = useState(0)
    const router = useRouter()

    const [roomInfo, setRoomInfo] = useState({ 
        id: "", 
        roomKey: 12345
    })

    useEffect(() => { 
        try { 

            const data = JSON.parse(localStorage.getItem("user")!) as {    participantId: string, 
            roomId: string, 
            roomKey: number,
            userName: string}

            if (!data) {
                localStorage.clear()
                router.push("/")
                return 
            }

            setRoomInfo((prev) => { 
                return { 
                    ...prev, 
                    roomKey: data.roomKey
                }
            })

        }catch(e) { 
            console.log(e)
            toast.error("something went wrong")
        }
    }, [])

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
                            {totalPlayers }
                        </motion.span>
                    </AnimatePresence>
                    <span className="text-gray-600">
                        {(totalPlayers) === 1 ? 'player' : 'players'}
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
            </motion.div>
        </div>
    )
}