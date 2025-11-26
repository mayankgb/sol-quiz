import express from "express"
import cors from "cors"
import { prisma } from "db/client"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
const app = express()
const port = 8080
import dotenv from "dotenv"

dotenv.config()

type sig = string
type status = "CONFIRM" | "PENDING"

const signatureMap = new Map<sig, status>()

app.use(express.json())
app.use(cors({
    origin: "*"
}))

interface nativeTransfers {
    amount: number,
    fromUserAccount: string,
    toUserAccount: string
}

app.get("/ping", async (req, res) => {
    console.log("working")
    res.status(200).json({
        message: "working"
    })
    return
})

app.post("/helius", async (req, res) => {

    const pendingSignature: string = req.body[0].signature ?? ''

    try {
        const header = req.headers.authorization
        console.log(header)
        console.log(req.body)
        if (header !== process.env.HELIUS_SECRET) {
            console.log("header is not present")
            console.log(process.env.HELIUS_SECRET)
            res.status(400).json({
                message: "unauthorised request"
            })
            return
        }

        console.log("working helius")
        // console.log(req.body)

        if (req.body[0].type !== "TRANSFER") {
            console.log("invalid request")
            res.json({
                message: "invalid request"
            })
            return
        }

        const body = req.body[0].nativeTransfers[0] as nativeTransfers
        console.log("this is the native transafer", req.body[0].nativeTransfers[0])
        const signature = req.body[0].signature

        if (signatureMap.has(signature)) {
            console.log("signture is already in the process");
            res.json({
                message: "already in the queue"
            })
            return
        }

        signatureMap.set(signature, "PENDING")

        if (body.toUserAccount === "7F1QYPbU3uvFagtRmXJKtYQ9NTeQcqTjNxZz3KSfatVX") {
            const response = await updatePendingPayments(body, req.body[0].signature)
            console.log(response)
        } else if (body.fromUserAccount === "7F1QYPbU3uvFagtRmXJKtYQ9NTeQcqTjNxZz3KSfatVX") {
            const response = await updateParticipantBalance(body, req.body[0].signature)
            console.log(response)
        }
        signatureMap.delete(signature)
        res.status(200).json({
            message: "working"
        })
        return
    } catch (e) {
        console.log(e)
        if (pendingSignature.length > 0) {
            signatureMap.delete(pendingSignature)    
        }
        res.status(500).json({
            message: "something went wrong"
        })
        return
    }
})

app.listen(port, () => {
    console.log("app is working")
    return
})

async function updatePendingPayments(data: nativeTransfers, signature: string) {
    console.log("this is the data from the webhook", data)
    const response = await prisma.$transaction(async (tx) => {
        const existingPaymemts = await tx.pendingPayments.findFirst({
            where: {
                signature: signature,
                walletAddress: data.fromUserAccount,
                status: "PENDING"
            },
            select: {
                id: true
            }
        })

        if (existingPaymemts) {
            await tx.pendingPayments.update({
                where: {
                    signature: signature,
                    walletAddress: data.fromUserAccount
                },
                data: {
                    status: "CONFIRMED",
                    amount: data.amount
                }
            })

            await tx.quiz.update({
                where: {
                    signature: signature
                },
                data: {
                    amountStatus: "CONFIRMED",
                    amount: data.amount
                }
            })
            return existingPaymemts.id
        }
        const lostTransaction = await tx.lostTransaction.create({
            data: {
                signature: signature,
                TransferAddress: data.fromUserAccount,
                ReciverAddress: data.toUserAccount,
                Amount: data.amount
            },
            select: {
                id: true
            }
        })
        return lostTransaction.id

    })
    return response
}

async function updateParticipantBalance(data: nativeTransfers, signature: string) {

    const response = await prisma.$transaction(async (tx) => {
        const existingParitcipant = await tx.participantRank.findFirst({
            where: {
                signature: signature,
                walletAddress: data.toUserAccount,
                creditStatus: "PENDING"
            },
            select: {
                id: true
            }
        })
        if (existingParitcipant) {
            await tx.participantRank.update({
                where: {
                    signature: signature,
                    walletAddress: data.toUserAccount,
                    creditStatus: "PENDING"
                },
                data: {
                    creditStatus: "CONFIRMED",
                    amount: data.amount
                }
            })
            return existingParitcipant.id
        }

        const lostTransactionId = await tx.lostTransaction.create({
            data: {
                TransferAddress: data.fromUserAccount,
                ReciverAddress: data.toUserAccount,
                Amount: data.amount,
                signature: signature
            },
            select: {
                id: true
            }
        })

        return lostTransactionId.id

    })

    return response
}