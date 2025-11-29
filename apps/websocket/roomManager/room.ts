
import { type CustomWebsocket, type QuizType } from "../types/types"
import { v4 as uuid, v4 } from "uuid"
import { type DbParticipant } from "../types/types"
import { type Question } from "../types/types"

interface Participant {
    participantId: string,
    walletAddress?: string,
    points: number,
    name: string
    submission: {
        questionId: string,
        index: number,
        isCorrect: boolean
    }[]
}

type participantId = string
type isCorrect = boolean

export class Room {


    roomId: string
    user: Participant[]
    userWs: Map<participantId, CustomWebsocket | null>
    adminId: string
    adminWs: CustomWebsocket | null
    roomkey: number
    question: Question[]
    currentQuestion: Question | null
    currentState: "LEADERBOARD" | "WAITING" | "STARTED" | 'ENDED'
    questionIndex: number
    private submissionCorrectness: Map<participantId, isCorrect>
    startTime!: number
    onEndQuiz: (roomId: string, roomKey: number, adminId: string, participant: DbParticipant[], quizType: QuizType) => void
    isPrizePool: boolean
    amount: number
    logo?: string
    tagline?: string
    title: string
    PromotionalLink?: string
    BrandName?: string
    isCampaign: boolean
    correctAnswer?: string

    constructor(
        question: Question[],
        adminId: string,
        roomId: string,
        roomkey: number,
        callback: (roomId: string, roomKey: number, adminId: string, participant: DbParticipant[], quizType: QuizType) => void,
        isCampaign: boolean,
        isPrizePool: boolean,
        amount: number,
        title: string,
        tagline?: string,
        PromotionalLink?: string,
        BrandName?: string) {

        this.user = []
        this.roomkey = roomkey
        this.userWs = new Map()
        this.adminWs = null
        this.currentQuestion = null
        this.questionIndex = 0
        this.submissionCorrectness = new Map()
        this.question = question
        this.currentState = "WAITING"
        this.adminId = adminId
        this.onEndQuiz = callback
        this.isPrizePool = isPrizePool
        this.isCampaign = isCampaign
        this.PromotionalLink = PromotionalLink
        this.BrandName = BrandName
        this.title = title
        this.tagline = tagline
        this.amount = amount
        this.roomId = roomId
    }

    startQuiz() {
        this.next()
    }

    adminJoin(ws: CustomWebsocket) {

        console.log("--------inside room---------")
        this.adminWs = ws
        ws.adminId = this.adminId
        ws.roomId = this.roomId
        ws.quizType = this.isCampaign ? "CAMPAIGN" : this.isPrizePool ? "PAID" : "REGULAR"
        this.sendQuestion(this.adminWs, this.adminId)
        return
    }

    next() {

        console.log("--------inside next--------")
        if (this.currentState !== "WAITING") {
            this.adminWs?.send(JSON.stringify({
                type: "error",
                message: "invalid request",
                status: 400
            }))
            return
        }

        console.log("-------- next user length--------", this.user.length)
        if (this.user.length === 0) {
            this.adminWs?.send(JSON.stringify({
                type: "error",
                message: "you need atleast two user to start the quiz"
            }))
            return
        }

        if (this.questionIndex >= this.question.length) {
            this.adminWs?.send(JSON.stringify({
                type: "error",
                message: "invalid request",
                status: 400
            }))
            return
        }

        this.currentQuestion = this.question[this.questionIndex]!
        this.startTime = new Date().getTime()
        this.questionIndex += 1;
        this.currentState = "STARTED"
        this.correctAnswer = this.currentQuestion.options.filter((value) => this.currentQuestion?.correctIndex === value.index)[0]?.option

        this.userWs.forEach((ws) => {
            ws?.send(JSON.stringify({
                question: this.currentQuestion?.question,
                options: this.currentQuestion?.options,
                state: this.currentState,
                totalPoints: 1000,
                message: "completed",
                startTime: this.startTime,
                status: 200,
                questionId: this.currentQuestion?.questionId
            }))
        })
        this.adminWs?.send(JSON.stringify({
            question: this.currentQuestion?.question,
            options: this.currentQuestion?.options,
            state: this.currentState,
            totalPoints: 1000,
            message: "completed",
            startTime: this.startTime,
            status: 200,
            questionId: this.currentQuestion?.questionId
        }))
        setTimeout(() => {
            this.leaderBoard()
        }, 10 * 1000)
        return

    }

    rejoin(participantWs: CustomWebsocket, participantId: string) {
        const existingparticipant = this.userWs.has(participantId)
        if (!existingparticipant) {
            return {
                type: "error",
                message: "you are not the existingUser",
                status: 400
            }
        }
        participantWs.userId = participantId
        participantWs.roomId = this.roomId
        participantWs.quizType = this.isCampaign ? "CAMPAIGN" : this.isPrizePool ? "PAID" : "REGULAR"
        this.userWs.set(participantId, participantWs)

        this.sendQuestion(participantWs, participantId)
        return {
            message: "ok",
            status: 200
        }
    }

    createUser(name: string, walletAddress?: string) {
        console.log("--------create user--------")
        if (this.isPrizePool && !walletAddress) {
            return {
                type: "error",
                message: "please provide the valid inputs",
                status: 400
            }
        }
        const newUserId = uuid()
        const newUser: Participant = {
            name: name,
            participantId: newUserId,
            submission: [],
            points: 0,
            walletAddress: walletAddress
        }

        this.user.push(newUser)
        this.userWs.set(newUserId, null)
        return {
            userId: newUserId,
            message: "user created",
            status: 200
        }

    }

    join(ws: CustomWebsocket, participantId: string) {

        console.log("--------inside join--------")

        const existingUser = this.user.find((value) => value.participantId === participantId)
        ws.userId = participantId
        ws.roomId = this.roomId
        ws.quizType = this.isCampaign ? "CAMPAIGN" : this.isPrizePool ? "PAID" : "REGULAR"
        this.userWs.set(participantId, ws)
        this.sendQuestion(ws, participantId)

        return {
            message: "successfully joined",
            status: 200
        }

    }

    leaderBoard() {
        this.currentState = "LEADERBOARD"

        console.log("--------leaderboard--------")

        const currentLeaderBoard = this.calculateResult()

        console.log("-----leaderboard correctness-------- \n", this.submissionCorrectness)

        this.user.map((value, index) => {
            this.userWs.get(value.participantId)?.send(JSON.stringify({
                state: this.currentState,
                leaderBoard: currentLeaderBoard,
                userPoints: value.points,
                userPosition: index,
                isCorrect: this.submissionCorrectness.get(value.participantId),
                correctAns: this.submissionCorrectness.get(value.participantId) ? "You are correct" : ` Correct answer is ${this.correctAnswer}`
            }))
        })

        this.submissionCorrectness.clear()

        this.adminWs?.send(JSON.stringify({
            state: this.currentState,
            leaderBoard: currentLeaderBoard,
        }))

        if (this.questionIndex >= this.question.length) {
            setTimeout(() => {
                this.currentState = "ENDED"
                this.userWs.forEach((ws) => {
                    ws?.send(JSON.stringify({
                        state: this.currentState,
                        userPoint: this.user[0]?.points,
                        userName: this.user[0]?.name,
                        CorrectQuestions: this.user[0]?.submission.map((value) => value.isCorrect && value).length,
                        isWinner: this.user[0]?.participantId === ws.userId
                    }))
                })
                this.adminWs?.send(JSON.stringify({
                    state: this.currentState,
                    userPoint: this.user[0]?.points,
                    userName: this.user[0]?.name,
                    CorrectQuestions: this.user[0]?.submission.map((value) => value.isCorrect && value).length
                }))
                this.endQuiz()

            }, 5 * 1000);
            return
        } else {
            this.currentState = "WAITING"

            setTimeout(() => {
                this.userWs.forEach((ws) => {
                    ws?.send(JSON.stringify({
                        totalPlayers: this.user.length,
                        state: this.currentState,
                        isAdmin: this.adminWs ? true : false
                    }))
                })
                if (!this.adminWs) {
                    setTimeout(() => {
                        this.next()

                    }, 5 * 1000);
                    return
                }
                this.adminWs?.send(JSON.stringify({
                    totalPlayers: this.user.length,
                    state: this.currentState
                }))
            }, 5 * 1000)
            return
        }
    }

    private calculateResult() {
        return this.user.sort((a, b) => b.points - a.points).map((value) => {
            return {
                participantId: value.participantId,
                points: value.points,
                name: value.name
            }
        }).slice(0, 5)
    }

    private sendQuestion(ws: CustomWebsocket, userId: string) {

        switch (this.currentState) {
            case "STARTED":
                ws.send(JSON.stringify({
                    question: this.currentQuestion?.question,
                    options: this.currentQuestion?.options,
                    state: this.currentState,
                    totalPoints: (1000 - 500 * ((new Date().getTime() - this.startTime) / (10 * 1000))),
                    startTime: this.startTime,
                    questionId: this.currentQuestion?.questionId
                }))
                break;
            case "WAITING":
                this.userWs.forEach((ws) => {
                    ws?.send(JSON.stringify({
                        state: this.currentState,
                        totalPlayers: this.user.length
                    }))
                })
                this.adminWs?.send(JSON.stringify({
                    state: this.currentState,
                    totalPlayers: this.user.length
                }))

                break;

            case "LEADERBOARD":
                ws.send(JSON.stringify({
                    state: this.currentState,
                    leaderBoard: this.user.slice(0, 5)
                }))
                break;
            case "ENDED":
                ws.send(JSON.stringify({
                    state: this.currentState,
                    userPoint: this.user[0]?.points,
                    userName: this.user[0]?.name,
                    CorrectQuestions: this.user[0]?.submission.map((value) => value.isCorrect && value).length
                }))
                break;


        }

    }

    checkSubmission(participantId: string, questionId: string, optionIndex: number) {

        const time = new Date().getTime()
        console.log("--------submission--------")
        console.log("submissoion parameter", "participantId", participantId, "questionId", questionId, optionIndex)

        if (this.currentState !== "STARTED") {
            return {
                type: "error",
                message: "bad request",
                status: 400
            }
        }

        if (this.userWs.has(participantId) && this.currentQuestion?.questionId === questionId) {
            console.log("------submission first checking")
            const existingParticipant = this.user.find((value) => value.participantId === participantId)

            if (existingParticipant) {
                const existingSubmission = this.submissionCorrectness.has(participantId)
                if (existingSubmission) {
                    return {
                        type: "error",
                        message: "you already submitted the question",
                        status: 400
                    }
                }

                if (this.currentQuestion.correctIndex === optionIndex) {
                    const points = (1000 - 500 * (time - this.startTime) / (10 * 1000))
                    existingParticipant.submission.push({
                        questionId: questionId,
                        index: optionIndex,
                        isCorrect: true
                    })
                    existingParticipant.points += points
                    this.submissionCorrectness.set(participantId, true)
                    return {
                        type: "message",
                        message: "successfully submitted the answer",
                        status: 200
                    }
                }
                this.submissionCorrectness.set(participantId, false)
                existingParticipant.submission.push({
                    questionId: questionId,
                    index: optionIndex,
                    isCorrect: false
                })
                return {
                    type: "message",
                    message: "successfullly submitted the answer",
                    status: 200
                }
            } else {
                return {
                    type: "error",
                    message: "Bad request",
                    status: 400
                }
            }
        } else {
            return {
                type: "error",
                message: "bad request",
                status: 400
            }
        }

    }

    private endQuiz() {

        console.log("--------end quiz--------")
        const participant = this.user.map((value, index) => ({
            name: value.name,
            id: value.participantId,
            quizId: this.roomId,
            points: value.points,
            walletAddress: value.walletAddress,
            rank: index + 1
        }))
        this.onEndQuiz(this.roomId, this.roomkey || 1222, this.adminId, participant, ((this.isCampaign || this.isPrizePool) ? "PAID" : "REGULAR"))
    }

    disconnect(ws: CustomWebsocket): { type: 'none' | "admin" | "user" } {
        if (ws.userId) {
            this.userWs.set(ws.userId, null)
            return {
                type: "user"
            }
        } else if (ws.adminId) {
            this.adminWs = null
            if (this.currentState === "WAITING") {
                if (this.user.length < 2) {
                    this.userWs.forEach((wss) => {
                        wss?.send(JSON.stringify({
                            type: "quit",
                            message: "admin is disconnected sufficient user are not present in the quiz so quiz is postponed"
                        }))
                    })
                    return {
                        type: "admin"
                    }
                }
                setTimeout(() => {
                    if (this.adminWs) {
                        return
                    }
                    this.next()
                }, 5 * 1000)

                this.userWs.forEach((wss) => {
                    wss?.send(JSON.stringify({
                        type: "error",
                        message: "next question will appear in 5 seconds"
                    }))
                })

            }
            return {
                type: "admin"
            }
        } else {
            return { type: "none" }
        }
    }


}