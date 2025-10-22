"use client"

import { getAllPayments } from "@/app/actions/getPayments"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDown, Clock, CheckCircle2, FileText, Ban } from "lucide-react"

interface QuizPayments { 
    quizId: string, 
    amountStatus: "PENDING" | "CONFIRMED" | "NO_PAYMENT",
    quizTitle: string, 
    allPayments: {
        id: string, 
        status: "PENDING" | "CONFIRMED", 
        signature: string | null, 
        createdAt: string
    }[]
}

export default function Payments() {
    const [data, setData] = useState<QuizPayments[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState("")
    const [expandedId, setExpandedId] = useState<string | null>(null)

    useEffect(() => { 
        async function main() { 
            setIsLoading(true)
            const response = await getAllPayments()

            if (response.status > 200) {
                toast.error(response.message)
                setIsError(response.message)
                setIsLoading(false)
                return
            } else if (!response.data || response.data.length === 0) { 
                toast.error("No data is present")
                setIsError("no data is present")
                setIsLoading(false)
                return
            } else { 
                const newData: QuizPayments[] = response.data.map((value) => { 
                    return { 
                        quizId: value.id, 
                        quizTitle: value.title, 
                        amountStatus: value.amountStatus === "CONFIRMED" ? "CONFIRMED" : value.amountStatus === "NO_PAYMENT" ? "NO_PAYMENT" : "PENDING", 
                        allPayments: value.PendingPayments.length === 0 ? [] : value.PendingPayments.map((v) => {
                            const date = v.createdAt.toLocaleDateString("en-US", { 
                                day: "numeric", 
                                month: "short", 
                                year: "numeric"
                            })
                            return { 
                                id: v.id, 
                                status: v.status === "CONFIRMED" ? "CONFIRMED" : "PENDING", 
                                signature: v.signature, 
                                createdAt: date
                            }
                        })
                    }
                })
                setData(newData)
                setIsLoading(false)
            }
        }
        main()
    }, [])

    const toggleAccordion = (id: string) => {
        setExpandedId(expandedId === id ? null : id)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-black text-lg">Loading payments...</div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-gray-600 text-lg">{isError}</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-1 h-12 bg-black rounded-full"></div>
                        <h1 className="text-4xl font-bold text-black">Payment Records</h1>
                    </div>
                    <p className="text-gray-500 text-lg ml-7">Track and manage all your quiz payment transactions</p>
                    <div className="mt-6 ml-7 flex gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-black"></div>
                            <span className="text-sm text-gray-600">
                                <span className="font-semibold text-black">{data.reduce((acc, quiz) => acc + quiz.allPayments.filter(p => p.status === "CONFIRMED").length, 0)}</span> Confirmed
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                            <span className="text-sm text-gray-600">
                                <span className="font-semibold text-black">{data.reduce((acc, quiz) => acc + quiz.allPayments.filter(p => p.status === "PENDING").length, 0)}</span> Pending
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                            <span className="text-sm text-gray-600">
                                <span className="font-semibold text-black">{data.filter(quiz => quiz.amountStatus === "NO_PAYMENT").length}</span> No Payment
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {data.map((quiz) => (
                        <motion.div
                            key={quiz.quizId}
                            className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <button
                                onClick={() => toggleAccordion(quiz.quizId)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    <FileText className="w-5 h-5 text-gray-600" />
                                    <span className="text-lg font-semibold text-black">{quiz.quizTitle}</span>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        {quiz.amountStatus === "CONFIRMED" ? (
                                            <>
                                                <CheckCircle2 className="w-5 h-5 text-black" />
                                                <span className="text-sm font-medium text-black">Confirmed</span>
                                            </>
                                        ) : quiz.amountStatus === "NO_PAYMENT" ? (
                                            <>
                                                <Ban className="w-5 h-5 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-400">No Payment</span>
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="w-5 h-5 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-500">Pending</span>
                                            </>
                                        )}
                                    </div>
                                    
                                    {quiz.amountStatus !== "NO_PAYMENT" && (
                                        <span className="text-xs text-gray-400 ml-2">
                                            {quiz.allPayments.length} {quiz.allPayments.length === 1 ? 'payment' : 'payments'}
                                        </span>
                                    )}
                                    
                                    <motion.div
                                        animate={{ rotate: expandedId === quiz.quizId ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDown className="w-5 h-5 text-gray-600" />
                                    </motion.div>
                                </div>
                            </button>

                            <AnimatePresence>
                                {expandedId === quiz.quizId && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-4 bg-gray-50">
                                            {quiz.amountStatus === "NO_PAYMENT" ? (
                                                <div className="py-6 text-center">
                                                    <Ban className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-gray-400 text-sm">This quiz does not require payment</p>
                                                </div>
                                            ) : quiz.allPayments.length === 0 ? (
                                                <div className="py-6 text-center text-gray-400">
                                                    No payments recorded
                                                </div>
                                            ) : (
                                                <div className="space-y-2 pt-3">
                                                    {quiz.allPayments.map((payment, index) => (
                                                        <motion.div
                                                            key={payment.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            className="bg-white border border-gray-100 rounded-md p-4 flex items-center justify-between hover:border-gray-200 transition-colors duration-200"
                                                            style={{ backgroundColor: payment.status === "CONFIRMED" ? "#FBF8FF" : "white" }}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {payment.status === "CONFIRMED" ? (
                                                                    <CheckCircle2 className="w-4 h-4 text-black" />
                                                                ) : (
                                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                                )}
                                                                <div className="max-w-xl">
                                                                    <div className="text-sm font-medium text-black">
                                                                        Payment #{payment.id.slice(0, 8)}
                                                                    </div>
                                                                    {payment.signature && (
                                                                        <div className="text-xs text-gray-500 font-mono mt-1 break-all">
                                                                            {payment.signature}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="text-right">
                                                                <div className="text-xs font-medium text-black">
                                                                    {payment.status}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {payment.createdAt}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}