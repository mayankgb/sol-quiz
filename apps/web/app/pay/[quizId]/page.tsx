"use client"
import { getQuizById } from "@/app/actions/getquiz"
import { createPayment, getPaymentStatus } from "@/app/actions/payment"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import { use, useEffect, useRef, useState } from "react"
import bs58 from "bs58"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Loader2, CheckCircle2, Wallet, ArrowRight, AlertCircle, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { DialogTitle } from "@radix-ui/react-dialog"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface QuizData { 
    id: string, 
    title: string, 
    templateId: string, 
    createdAt: string, 
    amount: number, 
    amountStatus: "PENDING"
}

type PaymentStep = "idle" | "sending" | "confirming" | "success" | "pending"

export default function Pay({ params}: { 
    params: Promise<{quizId: string}>
}) {
    const {quizId} = use(params)
    const [quizData, setQuizData] = useState<QuizData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [txLoading, setTxLoading] = useState(false)
    const [isConfirmed, setIsConfirmed] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [paymentStep, setPaymentStep] = useState<PaymentStep>("idle")
    const retries = useRef<number>(1)
    const [txInfo, setTxInfo] = useState({ 
        id: "", 
        signature: ""
    })
    const {publicKey, signTransaction, sendTransaction} = useWallet()
    const { connection } = useConnection()
    const router = useRouter()

    useEffect(() => { 
        async function main() { 
            setIsLoading(true)
            const response = await getQuizById(quizId)

            if (!response.data) {
                setIsLoading(false)
                return
            }
            const date = response.data.CreatedAt.toLocaleDateString("en-Us", { 
                day: "numeric", 
                month: "short", 
                year: "numeric"
            })

            const data: QuizData = { 
                id: response.data.id, 
                templateId: response.data.templateId, 
                title: response.data.title, 
                createdAt: date, 
                amount: (response.data.amount / LAMPORTS_PER_SOL), 
                amountStatus:"PENDING"
            }
            setQuizData(data)
            setIsLoading(false)
        }
        main()
    }, [])

    async function checkPaymentStatus() { 
        if (!quizData) {
            return 
        }
        setIsConfirmed(false)
        setPaymentStep("confirming")
        
        const status = await getPaymentStatus(quizData.id)

        if (status.amountStatus == "pending") { 
            return new Promise<void>((resolve) => { 
                setTimeout(async () => { 
                if (retries.current === 4) {   
                    setIsConfirmed(true)
                    setPaymentStep("pending")
                    resolve()
                    return
                }
                retries.current += 1
                await checkPaymentStatus()
            }, retries.current * 1000)
            })
        } else { 
            setIsConfirmed(true)
            setPaymentStep("success")
        }
    }

    async function newPayment(signature: string){ 
        if (!publicKey) {
            return
        }
        setTxLoading(true)
        const response = await createPayment(quizId, signature, quizData!.amount, publicKey.toBase58())

        if (response.status === 200 && response.transactionId) {
            setTxInfo((prev) => { 
                return { 
                    ...prev, 
                    id: response.transactionId
                }
            })
        }
        setTxLoading(false)
    }

    async function sendSol() { 
        const sendToPublicKey = new PublicKey("7F1QYPbU3uvFagtRmXJKtYQ9NTeQcqTjNxZz3KSfatVX")
        if (!publicKey) {
            console.log("public key is not present")
            return
        }
        if (!signTransaction) {
            return
        }

        setShowModal(true)
        setPaymentStep("sending")
        console.log("this is the amount",quizData?.amount)
        console.log("this is the floor amount",Math.floor(quizData!.amount * LAMPORTS_PER_SOL))

        try {
            const tx = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey, 
                    toPubkey: sendToPublicKey,
                    lamports: Math.floor( quizData!.amount * LAMPORTS_PER_SOL)
                })
            )

            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight }
            } = await connection.getLatestBlockhashAndContext();

            tx.lastValidBlockHeight = lastValidBlockHeight
            tx.recentBlockhash = blockhash
            tx.feePayer = publicKey
            const test = await signTransaction(tx)
            const sig = bs58.encode(test.signature!);
            console.log("this is the signature",sig)
            setTxInfo((prev) => { 
                return{ 
                    ...prev, 
                    signature: sig
                }
            })
            
            await newPayment(sig)
            const signature = await sendTransaction(tx, connection, { minContextSlot}) 
            await connection.confirmTransaction({blockhash, lastValidBlockHeight, signature})
            await checkPaymentStatus()
        } catch (error) {
            console.log("Transaction failed:", error)
            setTxLoading(false)
            setShowModal(false)
            toast.error("transaction denied")
            setPaymentStep("idle")
            return
        }
    }

    const closeModal = () => {
        if (paymentStep === "success" ) {
            setShowModal(false)
            setPaymentStep("idle")
            router.push("/dashboard")
            retries.current = 1
        }else if (paymentStep === "pending") {
            setShowModal(false)
            setPaymentStep('idle')
            router.push("/payments")
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-black flex flex-col items-center gap-4"
                >
                    <Loader2 className="w-12 h-12 animate-spin text-gray-600" />
                    <p className="text-gray-600">Loading payment details...</p>
                </motion.div>
            </div>
        )
    }

    return ( 
        <div className="min-h-screen bg-gray-50 text-black flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <Card className="bg-white border-gray-200 shadow-lg overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300" />
                    
                    <CardHeader className="border-b border-gray-200">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <CardTitle className="text-2xl text-black">Complete Payment</CardTitle>
                            <CardDescription className="text-gray-600 mt-2">
                                Review your quiz details and confirm the transaction
                            </CardDescription>
                        </motion.div>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-6">
                        {!publicKey && (
                            <Alert className="bg-gray-50 border-gray-300">
                                <AlertCircle className="h-4 w-4 text-gray-600" />
                                <AlertDescription className="text-gray-700">
                                    Please connect your wallet to continue
                                </AlertDescription>
                            </Alert>
                        )}

                        {quizData && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-4"
                            >
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-black mb-1">
                                                {quizData.title}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Created on {quizData.createdAt}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <span className="text-gray-600">Quiz ID</span>
                                        <span className="text-sm font-mono text-gray-700">
                                            {quizData.id.slice(0, 8)}...{quizData.id.slice(-8)}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Amount to Pay</p>
                                            <p className="text-4xl font-bold text-black">
                                                {quizData.amount} <span className="text-2xl text-gray-600">SOL</span>
                                            </p>
                                        </div>
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                                            <Wallet className="w-8 h-8 text-gray-600" />
                                        </div>
                                    </div>
                                </div>

                                {publicKey && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500 mb-2">Connected Wallet</p>
                                        <p className="text-sm font-mono text-gray-700 break-all">
                                            {publicKey.toBase58()}
                                        </p>
                                    </div>
                                )}

                                <WalletMultiButton/>

                                <motion.div
                                    whileHover={{ scale: publicKey && !txLoading ? 1.02 : 1 }}
                                    whileTap={{ scale: publicKey && !txLoading ? 0.98 : 1 }}
                                >
                                    <Button
                                        onClick={sendSol}
                                        disabled={!publicKey || txLoading || !isConfirmed}
                                        className="w-full h-14 text-lg font-semibold text-black disabled:bg-gray-200 disabled:text-gray-400 transition-all duration-300 border-0"
                                        style={{
                                            backgroundColor: publicKey && isConfirmed && !txLoading ? '#FAF7FF' : undefined
                                        }}
                                    >
                                        Confirm Payment
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </motion.div>

                                <p className="text-xs text-center text-gray-500">
                                    By confirming, you authorize the transfer of {quizData.amount} SOL from your wallet
                                </p>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Payment Status Modal */}
            <Dialog open={showModal} onOpenChange={closeModal}>
                <DialogContent className="bg-white border-gray-200 sm:max-w-md">
                    <DialogTitle>Transaction</DialogTitle>
                    <AnimatePresence mode="wait">
                        {paymentStep === "sending" && (
                            <motion.div
                                key="sending"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center py-8"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="mb-4"
                                >
                                    <Loader2 className="w-16 h-16 text-gray-600 " />
                                </motion.div>
                                <h3 className="text-xl font-semibold text-black mb-2">Sending Transaction</h3>
                                <p className="text-gray-600 text-center text-sm">
                                    Please wait while your transaction is being sent to the blockchain...
                                </p>
                            </motion.div>
                        )}

                        { paymentStep ==="confirming" && (
                            <motion.div
                                key="confirming"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center py-8"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="mb-4"
                                >
                                    <Loader2 className="w-16 h-16 text-gray-600" />
                                </motion.div>
                                <h3 className="text-xl font-semibold text-black mb-2">Confirming Payment</h3>
                                <p className="text-gray-600 text-center text-sm">
                                    Verifying your payment on the blockchain. This may take a few moments...
                                </p>
                                <div className="mt-4 text-xs text-gray-500">
                                    Attempt {retries.current} of 4
                                </div>
                            </motion.div>
                        )}

                        {paymentStep === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center py-8"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                >
                                    <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
                                </motion.div>
                                <h3 className="text-xl font-semibold text-black mb-2">Payment Completed!</h3>
                                <p className="text-gray-600 text-center text-sm mb-4">
                                    Your transaction has been successfully confirmed on the blockchain.
                                </p>
                                {txInfo.signature && (
                                    <div className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1">Transaction Signature</p>
                                        <p className="text-xs font-mono text-gray-700 break-all">{txInfo.signature}</p>
                                    </div>
                                )}
                                <Button
                                    onClick={closeModal}
                                    className="mt-6 w-full text-black border-0"
                                    style={{ backgroundColor: '#FAF7FF' }}
                                >
                                    go to dashboard
                                </Button>
                            </motion.div>
                        )}

                        {paymentStep === "pending" && (
                            <motion.div
                                key="pending"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center py-8"
                            >
                                <Clock className="w-16 h-16 text-yellow-600 mb-4" />
                                <h3 className="text-xl font-semibold text-black mb-2">Payment Pending</h3>
                                <p className="text-gray-600 text-center text-sm mb-4">
                                    Your payment is still being processed. Please check back later or contact support if the issue persists.
                                </p>
                                {txInfo.signature && (
                                    <div className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1">Transaction Signature</p>
                                        <p className="text-xs font-mono text-gray-700 break-all">{txInfo.signature}</p>
                                    </div>
                                )}
                                <Button
                                    onClick={closeModal}
                                    className="mt-6 w-full text-black border-0"
                                    style={{ backgroundColor: '#FAF7FF' }}
                                >
                                    see pending payments
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </div>
    )
}