import  WebSocket  from "ws";
import { z } from "zod"

export interface CustomWebsocket extends WebSocket  {
    userId: string
    roomId: string
    adminId: string
    quizType: QuizType
}


export const createParticipantSchema = z.object({
    name: z.string(),
    roomKey: z.number(),
    roomId: z.string(),
    walletAddress: z.string().optional()
})


export type QuizType = "PAID" | "CAMPAIGN" | "REGULAR" 


export interface DbParticipant {
    name: string;
    id: string;
    quizId: string;
    points: number;
    walletAddress: string | undefined;
    rank: number;
}

export interface Question {
    questionId: string,
    question: string,
    imageUrl?: string
    correctIndex: number
    options: {
        option: string,
        index: number,
    }[]
}