"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import { prisma } from "db/client"

export async function getPaymentStatus(quizId: string) {
    try {

        const session = await getServerSession(authOptions)

        if (!session) {
            return {
                message: "please login first",
                status: 401
            }
        }

        const response = await prisma.quiz.findFirst({
            where: {
                id: quizId,
                quizStatus: "DRAFTED",
                userId: session.user.id
            },
            select: {
                id: true,
                amountStatus: true
            }
        })

        return {
            message: "ok",
            status: 200,
            amountStatus: response?.amountStatus == "PENDING" ? "pending" : response?.amountStatus == "CONFIRMED" && 'confirmed'
        }

    } catch (e) {
        console.log(e)
        return {
            message: "Something went wrong",
            status: 500
        }
    }
}

export async function createPayment(quizId: string, signature: string, amount: number, walletAddress: string) {
    try {

        const session = await getServerSession(authOptions)

        if (!session) {
            return {
                message: "please login first",
                status: 401
            }
        }

        const response = await prisma.$transaction(async (tx) => {
            const quiz = await tx.quiz.update({
                where: {
                    id: quizId,
                    userId: session.user.id
                },
                data: {
                    signature: signature
                },
                select: {
                    id: true
                }
            })

            const newPaymentId = await tx.pendingPayments.create({
                data: {
                    quizid: quizId,
                    amount: amount,
                    status: "PENDING",
                    walletAddress: walletAddress,
                    userId: session.user.id, 
                    signature: signature
                },
                select: {
                    id: true
                }
            })
            return {
                transactionId: newPaymentId.id
            }
        })

        return {
            message: "ok",
            status: 200,
            transactionId: response.transactionId
        }

    } catch (e) {
        console.log(e)
        return {
            message: "something went wrong",
            status: 500
        }
    }
}