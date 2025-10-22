"use server"

import { prisma } from "@/index"
import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"

import { Option, UpdatedOption, UpdatedQuestion } from "@/types/types"

export async function createQuestion(id: string, question: string, correctIndex: number, templateId: string, option: Option[]) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return {
                status: 401,
                message: "unauthorised access"
            }
        }

        const newQuestion = await prisma.$transaction(async (tx) => {

            const isDrafted = await tx.quiz.findFirst({
                where: {
                    userId: session.user.id,
                    templateId: templateId
                },
                select: {
                    quizStatus: true
                }
            })

            if (isDrafted?.quizStatus !== "DRAFTED") {
                return {
                    message: "Bad Request",
                    status: 400
                }
            }

            const isExitisting = await tx.template.findUnique({
                where: {
                    userId: session.user.id,
                    id: templateId
                },
                select: {
                    id: true
                }
            })
            if (!isExitisting) {
                return {
                    status: 401,
                    message: "unauthorised acesss"
                }
            }
            const questionId = await tx.question.create({
                data: {
                    id: id,
                    question: question,
                    correctIndex: correctIndex,
                    templateId: templateId
                },
                select: {
                    id: true
                }
            })
            await tx.options.createMany({
                data: option
            })

            return {
                message: "added successfully",
                data: questionId.id,
                status: 200
            }
        })

        return {
            status: newQuestion.status,
            message: newQuestion.message,
            data: newQuestion.data
        }

    } catch (e) {
        console.log(e)
        return {
            status: 500,
            message: "something went wronfg"
        }
    }
}



export async function updateManyQuestion(templateId: string, question: UpdatedQuestion[], option: UpdatedOption[]) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return {
                message: "unauthorised acces",
                status: 401
            }
        }
        const response = await prisma.$transaction(async (tx) => {

            const isDrafted = await tx.quiz.findFirst({
                where: {
                    userId: session.user.id,
                    templateId: templateId
                },
                select: {
                    quizStatus: true
                }
            })

            if (isDrafted?.quizStatus !== "DRAFTED") {
                return {
                    message: "Bad Request",
                    status: 400
                }
            }

            const isExitisting = await tx.template.findUnique({
                where: {
                    userId: session.user.id,
                    id: templateId
                },
                select: {
                    id: true
                }
            })

            if (!isExitisting?.id) {
                return {
                    message: "unauthorised access",
                    status: 401
                }
            }
            await tx.question.updateMany({
                where: {
                    templateId: templateId
                },
                data: question
            })
            await tx.options.updateMany({
                data: option
            })
            return {
                message: "updated successfully",
                status: 200
            }
        })

        return response

    } catch (e) {
        console.log(e)
        return {
            message: "something went wrong please try again later",
            status: 500
        }
    }
}

export async function updateQuestion(templateId: string, question: UpdatedQuestion, option: UpdatedOption[]) {
    try {
        console.log(option)
        const session = await getServerSession(authOptions)
        if (!session) {
            return {
                message: "unauthorised access",
                status: 401
            }
        }
        const response = await prisma.$transaction(async (tx) => {
            const isDraft = await tx.quiz.findFirst({
                where: {
                    templateId: templateId,
                    userId: session.user.id
                },
                select: {
                    quizStatus: true
                }
            })

            if (isDraft?.quizStatus !== "DRAFTED") {
                return {
                    message: "Bad Request",
                    status: 400
                }
            }

            const updateQuestion = await tx.question.update({
                where: {
                    templateId: templateId,
                    id: question.id
                },
                data: question
            })

            for (const value of option) {
                await tx.options.upsert({
                    where: {
                        questionId: question.id,
                        id: value.id
                    },
                    update: {
                        id: value.id,
                        index: value.index,
                        text: value.text,
                        questionId: value.questionId
                    },
                    create: {
                        id: value.id,
                        index: value.index,
                        text: value.text,
                        questionId: value.questionId
                    }
                })
            }



            return {
                message: "updated successfully",
                status: 200
            }
        })
        return response
    } catch (e) {
        console.log(e)
        return {
            message: "something went wrong",
            status: 500
        }
    }
}

export async function deleteOption(templateId: string, questionId: string, optionId: string, isCorrect: boolean, correctIndex?: number) {

    try {

        const session = await getServerSession(authOptions)
        if (!session) {
            return {
                message: "please login first",
                status: 401
            }
        }

        const response = await prisma.$transaction(async (tx) => {
            const isExisting = await tx.quiz.findFirst({
                where: {
                    userId: session.user.id,
                    templateId: templateId
                },
                select: {
                    id: true,
                    quizStatus: true
                }
            })

            if (!isExisting || isExisting.quizStatus !== "DRAFTED") {
                return {
                    message: "invalid quiz or template id",
                    status: 401
                }
            }

            const id = await tx.options.delete({
                where: {
                    id: optionId
                }
            })

            if (isCorrect) {
                await tx.question.update({
                    where: {
                        id: questionId
                    },
                    data: {
                        correctIndex: correctIndex
                    }
                })
            }


            return {
                message: "updated successfully",
                status: 200
            }
        })

        return response

    } catch (e) {
        console.log(e)
        return {
            message: "something went wrong",
            status: 500
        }
    }
}

export async function deleteQuestion(templateId: string, questionId: string) {
    try {

        const session = await getServerSession(authOptions)
        if (!session) {
            return {
                message: "please login first",
                status: 401
            }
        }

        const response = await prisma.$transaction(async (tx) => {
            const isExisting = await tx.quiz.findFirst({
                where: {
                    templateId: templateId,
                    userId: session.user.id
                },
                select: {
                    id: true,
                    quizStatus: true
                }
            })

            if (!isExisting || isExisting.quizStatus !== "DRAFTED") {
                return {
                    message: "bad request",
                    status: 400
                }
            }

            await tx.question.delete({
                where: {
                    templateId: templateId,
                    id: questionId
                }
            })

            return {
                message: "deleted successfully",
                status: 200
            }
        })

        return response

    } catch (e) {
        console.log(e)
        return {
            message: "something went wrong",
            status: 500
        }
    }
}


export async function createTemplateQuiz(templateId: string, quizTitle: string) {
    try {

        const session = await getServerSession(authOptions)

        if (!session) {
            return {
                message: "please login first",
                status: 401
            }
        }

        const response = await prisma.$transaction(async (tx) => {
            const isPrivate = await tx.template.findFirst({
                where: {
                    id: templateId,
                    isPrivate: false
                },
                select: {
                    id: true,
                    isPrivate: true
                }
            })

            if (isPrivate?.isPrivate) {
                return {
                    message: "unauthorised access",
                    status: 401
                }
            }

            const quizId = await tx.quiz.create({
                data: {
                    userId: session.user.id,
                    templateId: templateId,
                    isPrizePool: false,
                    title: quizTitle,
                    quizStatus: "CREATED",
                    amountStatus: "NO_PAYMENT",
                    isTemplate: true
                },
                select: {
                    id: true
                }
            })

            return {
                message: "quiz created",
                status: 200,
                data: quizId.id
            }

        })

        return response

    } catch (e) {
        console.log(e)
        return {
            message: "something went wrong ",
            status: 500
        }
    }
}


export async function createNewTemplateQuiz(quizTitle: string) {
    try {

        const session = await getServerSession(authOptions)

        if (!session) {
            return {
                message: "please login first",
                status: 401
            }
        }

        const response = await prisma.$transaction(async (tx) => {
            const templateId = await tx.template.create({
                data: {
                    userId: session.user.id,
                    title: quizTitle,
                    isCampaign: false,
                    isPrivate: true,
                },
                select: {
                    id: true
                }
            })

            const quizId = await tx.quiz.create({
                data: {
                    templateId: templateId.id,
                    title: quizTitle,
                    isPrizePool: false,
                    amountStatus: "NO_PAYMENT",
                    quizStatus: "DRAFTED",
                    userId: session.user.id
                },
                select: {
                    id: true
                }
            })

            return {
                templateId,
                quizId
            }
        })

        return {
            message: "created successfully",
            status: 200,
            templateId: response.templateId
        }

    } catch (e) {
        console.log(e)
        return {
            message: "something went wrong",
            status: 500
        }
    }
}

export async function createPaidQuiz(quizTitle: string, prize: number, description: string) {
    try {

        const session = await getServerSession(authOptions)

        if (!session) {
            return {
                message: "please login first",
                status: 401
            }
        }

        const response = await prisma.$transaction(async (tx) => {
            const template = await tx.template.create({
                data: {
                    title: quizTitle,
                    isCampaign: false,
                    isPrivate: true,
                    userId: session.user.id,

                },
                select: {
                    id: true
                }
            })

            const quiz = await tx.quiz.create({
                data: {
                    templateId: template.id,
                    userId: session.user.id,
                    isPrizePool: true,
                    amountStatus: "PENDING",
                    quizStatus: "DRAFTED",
                    title: quizTitle,
                    amount: prize,
                },
                select: {
                    id: true
                }
            })

            return {
                quizId: quiz.id,
                templateId: template.id
            }
        })

        return {
            message: "created successfully",
            status: 200,
            quizId: response.quizId,
            templateId: response.templateId
        }

    } catch (e) {
        console.log(e)
        return {
            messsage: 'something went wrong',
            status: 500
        }
    }
}

export async function updateQuizStatus(templateId: string) {
    try {

        const session = await getServerSession(authOptions)

        if (!session) {
            return { 
                message: "please login first", 
                status: 200
            }
        }

        const isQuestion = await prisma.template.findFirst({ 
            where: { 
                id: templateId, 
            }, 
            select: { 
                _count: {
                    select : { 
                        Question: true
                    }
                }
            }
        })

        const a = isQuestion?._count.Question

        if (!isQuestion?._count.Question) {
           return{ 
            message: "quiz atleast have 1 question", 
            status: 400
           } 
        }

        const response = await prisma.quiz.updateMany({ 
            where: { 
                templateId: templateId, 
                userId: session.user.id
            }, 
            data: { 
                quizStatus: "CREATED"
            }
        })

        return { 
            message: "updated status", 
            status: 200
        }

    }catch(e) { 
        console.log(e)
        return { 
            message: "Something went wrong", 
            status: 500
        }
    }
}

export async function editQuizStatus(templateId: string) {
    try {

        const session = await getServerSession(authOptions)

        if (!session) {
            return { 
                message: "please login first", 
                statud: 200
            }
        }

        const response = await prisma.quiz.updateMany({ 
            where: { 
                templateId: templateId, 
                userId: session.user.id
            }, 
            data: { 
                quizStatus: "DRAFTED"
            }
        })

        return { 
            message: "updated status", 
            status: 200
        }

    }catch(e) { 
        console.log(e)
        return { 
            message: "Something went wrong", 
            status: 500
        }
    }
}