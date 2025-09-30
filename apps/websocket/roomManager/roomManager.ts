
import Redis from "ioredis"
import { Room } from "./room"
import type { CustomWebsocket, DbParticipant, QuizType } from "../types/types"
import { prisma } from "db/client"
import { type Question } from "../types/types"


type adminId = string
type roomId = string
type roomKey = number

export class RoomManager {
    public static instance: RoomManager
    private roomAdmin: Map<adminId, roomId>
    private campaignsRoom: Map<roomId, Room>
    private PaidRoom: Map<roomId, Room>
    private RegularRoom: Map<roomId, Room>
    roomkey: Map<roomKey, roomId>
    private redis: Redis


    private constructor() {
        this.roomAdmin = new Map()
        this.campaignsRoom = new Map()
        this.PaidRoom = new Map()
        this.RegularRoom = new Map()
        this.roomkey = new Map()
        this.redis = new Redis({
        host: process.env.BROKERS, 
        password: process.env.PASSWORD, 
        port: 19373, 
        db: 0
    });

    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new RoomManager
        }
        return this.instance
    }

    adminJoin(adminId: string, adminWs: CustomWebsocket) {
        const existingRoomId = this.roomAdmin.get(adminId)
        console.log(adminId)
        console.log("roomAdmin", this.roomAdmin)
        console.log("existingRoomId", existingRoomId)
        if (existingRoomId) {
            if (this.PaidRoom.has(existingRoomId)) {
                this.PaidRoom.get(existingRoomId)?.adminJoin(adminWs)
                return
            } else if (this.RegularRoom.has(existingRoomId)) {
                this.RegularRoom.get(existingRoomId)?.adminJoin(adminWs)
                return
            } else {
                this.campaignsRoom.get(existingRoomId)?.adminJoin(adminWs)
            }
        } else {
            adminWs.send(JSON.stringify({
                message: "unauthorised access"
            }))
        }

    }

    next(roomId: string, adminId: string) {
        if (!roomId || !adminId) {
            console.log("roomid", roomId, "adminId", adminId)
            return {
                message: "invalid inputs",
                status: 400
            }
        }

        const existingQuiz = this.roomAdmin.get(adminId)
        if (!existingQuiz) {
            return {
                message: "no quiz found",
                status: 400
            }
        }
        const room = this.PaidRoom.get(roomId) ? this.PaidRoom.get(roomId) : (this.RegularRoom.get(roomId) ? this.RegularRoom.get(roomId) : this.campaignsRoom.get(roomId))

        room?.next()

        return {
            message: "action completed",
            status: 200
        }

    }

    submission(roomId: string, particpantId: string, index: number, questionId: string, roomkey: string) {

        const room = this.PaidRoom.get(roomId) ? this.PaidRoom.get(roomId) : (this.RegularRoom.get(roomId) ? this.RegularRoom.get(roomId) : this.campaignsRoom.get(roomId))

        room?.checkSubmission(particpantId, questionId, index)
        return

    }

    createUser(name: string, roomKey: number, roomId: string, walletAddress?: string) {
        console.log("-----create user-------")
        console.log("wallet address", walletAddress)
        if (!name || !roomKey || !roomId) {
            console.log("name is ", name, "roomKey is", roomKey, "roomId is ", roomId)
            return {
                message: "invalid inputs",
                status: 400
            }
        }

        const existingRoomId = this.roomkey.get(roomKey)
        if (!existingRoomId || existingRoomId !== roomId) {
            return {
                message: "bad request",
                status: 400
            }
        }

        const room = this.PaidRoom.get(roomId) ? this.PaidRoom.get(roomId) : (this.RegularRoom.get(roomId) ? this.RegularRoom.get(roomId) : this.campaignsRoom.get(roomId))

        if (!room) {
            return {
                message: "room is not found",
                status: 400
            }
        }

        const response = room.createUser(name, walletAddress)

        if (response.status > 200 || !response.userId) {
            return {
                message: response.message,
                status: response.status
            }
        }

        return {
            message: response.message,
            participantd: response.userId,
            roomKey: roomKey,
            roomId: roomId,
            status: response.status
        }

    }

    join(participantId: string, ws: CustomWebsocket, roomKey: number, roomId: string) {

        if (!participantId || !ws || !roomKey || !roomId) {
            if (!ws) {
                console.log("websocket is not present")
            }
            console.log("participantId is ", participantId, "roomKey is", roomKey, "roomId is ", roomId)
            return
        }

        const existingRoomId = this.roomkey.get(roomKey)

        if (!existingRoomId) {
            ws.send(JSON.stringify({
                message: "room doesn't exists"
            }))
            console.log("room is not present")
            return
        }

        const room = this.PaidRoom.get(roomId) ? this.PaidRoom.get(roomId) : (this.RegularRoom.get(roomId) ? this.RegularRoom.get(roomId) : this.campaignsRoom.get(roomId))

        const response = room?.join(ws, participantId)
        console.log(response)
        return
    }

    async initialiseQuiz(quizId: string, adminId: string) {
        console.log("initialise quiz quizID", quizId)
        console.log("initilaise adminId", quizId)
        if (this.roomAdmin.has(adminId)) {
            return {
                message: "request is already in queue",
                status: 200
            }
        }

        this.roomAdmin.set(adminId, quizId)
        try {

            const response = await prisma.$transaction(async (tx) => {
                const data = await tx.quiz.findFirst({
                    where: {
                        id: quizId,
                        quizStatus: "CREATED"
                    },
                    select: {
                        isPrizePool: true,
                        amount: true,
                        template: {
                            select: {
                                isCampaign: true,
                                title: true,
                                logo: true,
                                tagLine: true,
                                PromotionalLink: true,
                                BrandName: true,

                                Question: {
                                    select: {
                                        id: true,
                                        question: true,
                                        correctIndex: true,
                                        imageUrl: true,
                                        options: {
                                            select: {
                                                text: true,
                                                index: true,
                                                id: true,

                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
                await tx.quiz.update({
                    where: {
                        id: quizId
                    },
                    data: {
                        quizStatus: "STARTED"
                    }
                })

                return data
            })

            if (!response) {
                return {
                    message: "no quiz found",
                    status: 400
                }

            }

            const questions = response.template.Question.map((value) => {
                const options = value.options.map((value) => {
                    return {
                        option: value.text,
                        index: value.index
                    }
                })
                const newQuestion: Question = {
                    correctIndex: value.correctIndex,
                    question: value.question,
                    questionId: value.id,
                    imageUrl: value.imageUrl ? value.imageUrl : undefined,
                    options: options
                }
                return newQuestion
            })

            const newRoom = new Room(questions, adminId, quizId, this.removeQuiz.bind(this), response.template.isCampaign, response.isPrizePool, response.amount, response.template.title, response.template.tagLine || undefined, response.template.PromotionalLink ?? undefined, response.template.BrandName ?? undefined)
            if (response.isPrizePool) {
                if (response.template.isCampaign) {
                    const roomKey = Math.floor(100000 + Math.random() * 900000);
                    this.roomkey.set(roomKey, quizId)
                    this.campaignsRoom.set(quizId, newRoom)
                    return {
                        message: "quiz initialised",
                        status: 200,
                        roomKey: roomKey
                    }
                }
                const roomKey = Math.floor(100000 + Math.random() * 900000);
                this.roomkey.set(roomKey, quizId)
                this.PaidRoom.set(quizId, newRoom)
                return {
                    message: "quiz initialised",
                    status: 200,
                    roomKey: roomKey
                }
            }
            const roomKey = Math.floor(100000 + Math.random() * 900000);
            this.roomkey.set(roomKey, quizId)
            this.RegularRoom.set(quizId, newRoom)
            return {
                message: "quiz initialised",
                status: 200,
                roomKey: roomKey
            }

        } catch (e) {
            console.log(e)
            this.roomAdmin.delete(adminId)
            return {
                message: 'something went wrong',
                status: 500
            }
        }

    }

    private async removeQuiz(roomId: string, roomKey: number, adminId: string, participant: DbParticipant[], quiztype: QuizType) {

        console.log("-----remove quiz------")

        if (quiztype === "PAID" || quiztype === "CAMPAIGN") {
            const winner = participant.shift()
            if (!winner) {
                return
            }
            await this.sendSolana(winner)
        }
        if (participant && participant.length) {
            await this.updateQuiz(participant, roomId)
        }

        this.roomAdmin.delete(adminId)
        this.RegularRoom.delete(roomId)
        this.PaidRoom.delete(roomId)
        this.campaignsRoom.delete(roomId)
        this.roomkey.delete(roomKey)
        return

    }

    hasRoom(roomKey: number) {
        const existingRoomId = this.roomkey.get(roomKey)
        if (existingRoomId) {
            return {
                message: "roomKey found",
                status: 200,
                roomId: existingRoomId,
                roomType: this.PaidRoom.has(existingRoomId) ? "PAID" : this.RegularRoom.has(existingRoomId) ? "REGULAR" : (this.campaignsRoom.has(existingRoomId) && "CAMPAIGN")
            }
        }
        console.log("room is not present with this is roomkey", roomKey)
        return {
            message: "room doesn't exists",
            status: 401
        }
    }

    private async updateQuiz(data: DbParticipant[], templateId: string) {
        console.log("-----update quiz------")
        try {

            const response = await prisma.$transaction(async (tx) => {
                await tx.participantRank.createMany({
                    data: data
                })

                await tx.quiz.update({
                    where: {
                        id: templateId
                    },
                    data: {
                        quizStatus: "ENDED"
                    }
                })
            })

            return {
                message: "updated",
                status: 200
            }

        } catch (e) {
            console.log(e)
            return {
                message: "something went wrong",
                status: 500
            }
        }
    }

    private async sendSolana(data: DbParticipant) {

        console.log("------send solana------")
        console.log("------solana data -------")
        try {

             this.redis.xadd(
                "quizchain",
                "*",
                "id", data.id,
                "templateId", data.quizId,
                "name", data.name,
                "points", data.points,
                "rank", data.rank,
                "walletAddress", data.walletAddress ? data.walletAddress : "no wallet"
            )
            return {
                message: "sent to redis",
                status: 200
            }

        } catch (e) {
            console.log(e)
            return {
                message: "something went wrong",
                status: 500
            }
        }
    }


    disconnect(ws: CustomWebsocket) {
        const room = this.PaidRoom.get(ws.roomId) ? this.PaidRoom.get(ws.roomId) : (this.RegularRoom.get(ws.roomId) ? this.RegularRoom.get(ws.roomId) : this.campaignsRoom.get(ws.roomId))
        room?.disconnect(ws)
        return
    }


}