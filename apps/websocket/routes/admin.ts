import { prisma } from "db/client";
import { Router } from "express";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { RoomManager } from "../roomManager/roomManager";
dotenv.config()

export const adminRouter = Router()

adminRouter.put("/start", async (req, res) => {

    console.log("working")
    try{
        const token = req.headers.authorization
        if (!token) {
            res.status(401).json({
                message: "unauthorised access"
            })
            return
        }
        const decode = jwt.verify(token,process.env.JWT_SECRET!) as { id: string }
        const { quizId } = req.body  
        const existingQuiz = await prisma.quiz.findFirst({
            where: {
                id: quizId, 
                userId: decode.id,
                quizStatus: "CREATED"
            },
            select: {
                isPrizePool: true, 
                amountStatus: true,
            }
        })
        if (!existingQuiz) {
            res.json({
                message: "invalid request quiz not found"
            })
            return
        }
        if (existingQuiz.isPrizePool) {
            if (existingQuiz.amountStatus === "PENDING" || existingQuiz.amountStatus === "FAILED") {
                res.json({
                    message : existingQuiz.amountStatus === "FAILED" ? "transaction failed please do another payment": "Your amount is in pending state",
                    status:400
                })
                return
            }
        }
        const response = await RoomManager.getInstance().initialiseQuiz(quizId, decode.id)
           if (response.status > 200) {
            res.status(response.status).json({
                message: response.message,
                roomKey: response.roomKey
            })
            return
           }
           console.log(response)
            res.status(response.status).json({
                message: response.message,
                roomKey: response.roomKey
            })
            
            return
    }catch(e) {
        console.log(e)
        res.status(500).json({
            message: "something went wrong"
        })
    }
})

