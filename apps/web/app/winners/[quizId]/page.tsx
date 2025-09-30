"use client"

import { getWinners } from "@/app/actions/getWinners"
import { use, useEffect, useState } from "react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Trophy, Crown, Medal, ArrowLeft, Calendar, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"

interface WinnersState { 
    winnerId: string, 
    name: string, 
    rank: number, 
    signature: string | null, 
    quiz: { 
        id: string,
        title: string, 
        isPrizePool: boolean, 
        amount: number, 
        createdAt: string
    }
}

export default function Winners({ params }: { params: Promise<{quizId: string}>}) { 

    const { quizId } = use(params)
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState<WinnersState[]>([])
    const [error, setIsError] = useState("")

    useEffect(() => { 
        async function main() { 
            setIsLoading(true)
            const response = await getWinners(quizId)

            if (response.status > 200) {
                toast.error(response.message)
                setIsError(response.message)
                setIsLoading(false)
                return
            } else if (response.data) { 
                const newData: WinnersState[] = response.data.length === 0 ? [] : response.data.map((value) => {
                    const date = value.quiz.CreatedAt.toLocaleDateString("en-US", { 
                        day: "numeric", 
                        month: "short", 
                        year: "numeric"
                    })
                    return { 
                        winnerId: value.id, 
                        rank: value.rank, 
                        signature: value.signature, 
                        name: value.name,
                        quiz: { 
                            id: value.quiz.id, 
                            title: value.quiz.title, 
                            isPrizePool: value.quiz.isPrizePool, 
                            amount: value.quiz.amount / LAMPORTS_PER_SOL, 
                            createdAt: date
                        }
                    }
                })
                setData(newData)
                setIsLoading(false)
            }
        }
        main()
    }, [quizId])

    const getRankIcon = (rank: number) => {
        switch(rank) {
            case 1:
                return <Crown className="w-8 h-8 text-black" />
            case 2:
                return <Medal className="w-7 h-7 text-gray-600" />
            case 3:
                return <Medal className="w-6 h-6 text-gray-400" />
            default:
                return <Trophy className="w-6 h-6 text-gray-300" />
        }
    }

    const getPodiumHeight = (rank: number) => {
        switch(rank) {
            case 1:
                return "h-64"
            case 2:
                return "h-48"
            case 3:
                return "h-40"
            default:
                return "h-32"
        }
    }

    const getCardBackground = (rank: number) => {
        switch(rank) {
            case 1:
                return "#FBF8FF"
            case 2:
                return "white"
            case 3:
                return "white"
            default:
                return "white"
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-black text-lg">Loading winners...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-gray-600 text-lg">{error}</div>
            </div>
        )
    }

    const quizInfo = data[0]?.quiz

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b flex justify-center items-center border-gray-200">
                <div className="min-w-7xl  px-8 py-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-black transition-colors duration-200"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="text-sm font-medium">Dashboard</span>
                        </button>
                        
                        <div className="flex-1 text-center">
                            <h1 className="text-2xl font-bold text-black">{quizInfo?.title || "Quiz Winners"}</h1>
                        </div>

                        {quizInfo && (
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{quizInfo.createdAt}</span>
                                </div>
                                {quizInfo.isPrizePool && (
                                    <div className="flex items-center gap-1">
                                        sol
                                        <span className="font-semibold text-black">{quizInfo.amount}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Winners Section */}
            <div className=" flex flex-col justify-center min-w-7xl mx-auto px-8 py-12">
                {data.length === 0 ? (
                    <div className="text-center py-20">
                        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No winners announced yet</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Podium View for Top 3 */}
                        <div className="flex items-end justify-center gap-8 mb-12">
                            {/* Second Place */}
                            {data[1] && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="mb-4 text-center">
                                        {getRankIcon(2)}
                                        <div className="mt-3 text-lg font-bold text-black">{data[1].name}</div>
                                        <div className="text-sm text-gray-500 mt-1">2nd Place</div>
                                    </div>
                                    <div className={`${getPodiumHeight(2)} w-40 bg-gray-100 border border-gray-200 rounded-t-lg flex items-center justify-center`}>
                                        <span className="text-4xl font-bold text-gray-400">2</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* First Place */}
                            {data[0] && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.5 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="mb-4 text-center">
                                        {getRankIcon(1)}
                                        <div className="mt-3 text-xl font-bold text-black">{data[0].name}</div>
                                        <div className="text-sm text-gray-500 mt-1">Champion</div>
                                    </div>
                                    <div className={`${getPodiumHeight(1)} w-40 rounded-t-lg flex items-center justify-center`} style={{ backgroundColor: '#FBF8FF', border: '2px solid black' }}>
                                        <span className="text-5xl font-bold text-black">1</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Third Place */}
                            {data[2] && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="mb-4 text-center">
                                        {getRankIcon(3)}
                                        <div className="mt-3 text-lg font-bold text-black">{data[2].name}</div>
                                        <div className="text-sm text-gray-500 mt-1">3rd Place</div>
                                    </div>
                                    <div className={`${getPodiumHeight(3)} w-40 bg-gray-50 border border-gray-200 rounded-t-lg flex items-center justify-center`}>
                                        <span className="text-3xl font-bold text-gray-300">3</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Detailed Cards */}
                        <div className="max-w-3xl mx-auto space-y-4">
                            <h2 className="text-xl font-bold text-black mb-6">Winner Details</h2>
                            {data.map((winner, index) => (
                                <motion.div
                                    key={winner.winnerId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                                    className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 "
                                    style={{ backgroundColor: getCardBackground(winner.rank) }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="flex-shrink-0">
                                                {getRankIcon(winner.rank)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-black">{winner.name}</h3>
                                                    <span className="text-sm text-gray-500">Rank #{winner.rank}</span>
                                                </div>
                                                {winner.signature && (
                                                    <div className="mt-2">
                                                        <div className="text-xs text-gray-500 mb-1">Transaction Signature:</div>
                                                        <div className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 break-all">
                                                            {winner.signature}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}