"use client"

import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "sonner"
import { useRoomInfoStore, useRoomState } from "@/store/userState"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Loader2, LogIn, User, Wallet as WalletIcon } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"

//   name: z.string(),
//     roomKey: z.number(),
//     roomId: z.string(),
//     walletAddress: z.string().optional()

export function RoomKey(){ 

    const [roomKey, setRoomKey] = useState("1234")
    const [name, setName] = useState("")
    const [walletAddress, setWalletAddress] = useState("")
    const [isError, setisError] = useState(false)
    const [error, setError] = useState("")
    const [fieldErrors, setFieldErrors] = useState({
        roomKey: false,
        name: false,
        wallet: false
    })
    const [isLoading, setIsLoading] = useState(false)
    const {roomId,roomType, setRoomInfo} = useRoomInfoStore()
    const {state, setState} = useRoomState()
    const router = useRouter()

    const validateFields = () => {
        const errors = {
            roomKey: !roomKey.trim(),
            name: state && !name.trim(),
            wallet: roomType === "PAID" && !walletAddress.trim()
        }

        setFieldErrors(errors)

        if (errors.roomKey) {
            toast.error("Please enter a room key")
            return false
        }

        if (errors.name) {
            toast.error("Please enter your name")
            return false
        }

        if (errors.wallet) {
            toast.error("Please enter your wallet address")
            return false
        }

        return true
    }

    async function getQuiz() {
         try { 

            if (!parseInt(roomKey)) {
                setFieldErrors(prev => ({ ...prev, roomKey: true }))
                toast.error("Please enter a valid room key")
                return 
            }

            if (!validateFields()) {
                return
            }

            setIsLoading(true)
            setisError(false)
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/getquiz`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    roomKey: parseInt(roomKey),
                    ...(state && { name: name.trim() }),
                    ...(roomType === "PAID" && { walletAddress: walletAddress.trim() })
                })
            })

            const data = await response.json()

            if (data.status > 200) {
                toast.error(data.message)
                setIsLoading(false)
                setError(data.message)
                setisError(true)
                return
            } else { 
                toast.success(data.message)
                setIsLoading(false)
                setRoomInfo("roomId", data.roomId)
                setRoomInfo("roomType", data.roomType)
                setRoomInfo("roomKey", parseInt(roomKey))
                setState(true)
                return
            }
            
         } catch(e) { 
            console.log(e)
            toast.error("Failed to join room")
            setIsLoading(false)
            setisError(true)
            setError("Failed to connect to server")
         }
    }

    async function createUser() { 
        try{ 
            setIsLoading(true)
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/create`, {
                roomId: roomId, 
                roomKey: parseInt(roomKey), 
                name: name,
                walletAddress: walletAddress
            })

            if (response.status > 200) {
                setIsLoading(false)
                toast.error(response.data.message)
                return
            }
            toast.success(response.data.message)
        //     message: response.message,
        // participantId: response.participantd,
        // roomId: response.roomId,
        // roomKey: response.roomKey

        const userMetadata = { 
            participantId: response.data.participantId, 
            roomId: response.data.roomId, 
            roomKey: response.data.roomKey,
            userName: name
        }

        localStorage.setItem("user", JSON.stringify(userMetadata))
        router.push(`/join/${roomId}`)

            
        }catch(e){ 
            setIsLoading(false)
            console.log(e)
            toast.error("something went wrong")
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            if (state) {
                createUser()
                return
            }
            getQuiz()
        }
    }

    return (
        <div className="flex flex-col h-screen w-screen bg-white">
            {/* Header */}
            <div className="w-full border-b border-gray-200 py-4 px-6">
                <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-semibold text-black"
                >
                    QuizChain
                </motion.p>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card className="bg-white border-gray-200 p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-200">
                                <LogIn className="w-6 h-6 text-gray-600" />
                            </div>

                            {/* Title */}
                            <h1 className="text-xl font-semibold text-black text-center mb-2">
                                Join Quiz
                            </h1>
                            <p className="text-sm text-gray-500 text-center mb-8">
                                Enter the room key to join the quiz
                            </p>

                            <div className="space-y-4">
                                {/* Room Key Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-600">
                                        Room Key <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        placeholder="Enter room key" 
                                        value={roomKey} 
                                        onChange={(e) => {
                                            setRoomKey(e.target.value)
                                            setisError(false)
                                            setFieldErrors(prev => ({ ...prev, roomKey: false }))
                                        }}
                                        onKeyPress={handleKeyPress}
                                        disabled={isLoading}
                                        className={`h-12 text-center text-lg font-semibold tracking-wider ${
                                            fieldErrors.roomKey ? 'border-red-300 focus-visible:ring-red-300' : 'border-gray-300'
                                        }`}
                                    />
                                    {fieldErrors.roomKey && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-xs text-red-600"
                                        >
                                            Room key is required
                                        </motion.p>
                                    )}
                                </div>

                                {/* Room Type Indicator */}
                                <AnimatePresence>
                                    {roomType && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className={`w-2 h-2 rounded-full ${roomType === "PAID" ? "bg-yellow-500" : "bg-green-500"}`} />
                                            <p className="text-xs text-gray-600">
                                                {roomType === "PAID" ? "Paid Quiz" : "Free Quiz"}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Name Input - Shows when state is true */}
                                <AnimatePresence>
                                    {state && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-2"
                                        >
                                            <label className="text-xs font-medium text-gray-600">
                                                Your Name <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input 
                                                    placeholder="Enter your name" 
                                                    value={name} 
                                                    onChange={(e) => {
                                                        setName(e.target.value)
                                                        setFieldErrors(prev => ({ ...prev, name: false }))
                                                    }}
                                                    onKeyPress={handleKeyPress}
                                                    disabled={isLoading}
                                                    className={`h-12 pl-10 ${
                                                        fieldErrors.name ? 'border-red-300 focus-visible:ring-red-300' : 'border-gray-300'
                                                    }`}
                                                />
                                            </div>
                                            {fieldErrors.name && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-xs text-red-600"
                                                >
                                                    Name is required
                                                </motion.p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Wallet Address Input - Only for Paid Quizzes */}
                                <AnimatePresence>
                                    {roomType === "PAID" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-2"
                                        >
                                            <label className="text-xs font-medium text-gray-600">
                                                Wallet Address <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <WalletIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input 
                                                    placeholder="Enter your wallet address" 
                                                    value={walletAddress} 
                                                    onChange={(e) => {
                                                        setWalletAddress(e.target.value)
                                                        setFieldErrors(prev => ({ ...prev, wallet: false }))
                                                    }}
                                                    onKeyPress={handleKeyPress}
                                                    disabled={isLoading}
                                                    className={`h-12 pl-10 font-mono text-sm ${
                                                        fieldErrors.wallet ? 'border-red-300 focus-visible:ring-red-300' : 'border-gray-300'
                                                    }`}
                                                />
                                            </div>
                                            {fieldErrors.wallet && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-xs text-red-600"
                                                >
                                                    Wallet address is required for paid quizzes
                                                </motion.p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* General Error Message */}
                                {isError && error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                                    >
                                        <p className="text-xs text-red-600">
                                            {error}
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button 
                                onClick={state ?createUser: getQuiz}
                                disabled={isLoading || !roomKey}
                                className="w-full h-12 text-sm font-semibold text-black border-0 hover:opacity-90 disabled:opacity-50 mt-6"
                                style={{ backgroundColor: '#FBF8FF' }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    'Join Quiz'
                                )}
                            </Button>

                            {/* Helper Text */}
                            <p className="text-xs text-gray-400 text-center mt-4">
                                Press Enter to join
                            </p>
                        </motion.div>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}