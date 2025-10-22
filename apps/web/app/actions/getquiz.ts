"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import { prisma } from "db/client"
import { $Enums } from "../../../../packages/db/src/generated/prisma"

export async function getQuiz() { 
    try { 

        const session = await getServerSession(authOptions)

        if (!session) {
            return { 
                message: "please login first", 
                status: 401
            }
        }

        const response = await prisma.quiz.findMany({ 
            where: { 
                userId: session.user.id,
                quizStatus: { 
                    in: ['CREATED', 'DRAFTED', 'ENDED']
                }
            }, 
            take: 3, 
            select: { 
                id: true,
                quizStatus: true, 
                title: true, 
                CreatedAt: true,
                template: { 
                    select: { 
                        _count: { 
                            select: { 
                                Question: true
                            }
                        }
                    }
                }, 
                _count: { 
                    select: { 
                        participantRank: true
                    }
                }
            }
        })

        return { 
            message: "successfully fetched the data", 
            status: 200, 
            data: response
        }
        
    }catch(e) { 
        console.log(e)
        return { 
            message: "something went wrong",
            status: 500
        }
    }
}

export async function getAllQuiz() { 
    try { 

        const session = await getServerSession(authOptions)
        
        if (!session) {
            return { 
                message: "please login first", 
                status: 401
            }
        }

        const data = await prisma.quiz.findMany({ 
            where: { 
                userId: session.user.id
            }, 
            select: { 
                title: true, 
                quizStatus: true, 
                amountStatus: true,
                id: true, 
                templateId: true , 
                isPrizePool: true , 
                CreatedAt: true, 
                isTemplate: true
            }
        })

        return { 
            message: "data fetched successfully", 
            status: 200, 
            data: data
        }

    }catch(e) { 
        console.log(e)
        return { 
            message: "something went wrong", 
            status: 500
        }
    }
}

export async function getTemplateQuiz() { 
    try { 
        const session = await getServerSession(authOptions)

        if (!session) {
            return { 
                message: "please login first", 
                status: 401
            }
        }

        const response = await prisma.template.findMany({ 
            where: { 
                isPrivate: false
            }, 
            select: { 
                id: true, 
                title: true,
            }
        })

        return { 
            message: "successfully fetched", 
            status: 200, 
            data: response
        }
        
    }catch(e) { 
        console.log(e)
        return { 
            message: "something went wrong", 
            status: 500
        }
    }
}

export async function getQuizById(quizId: string) { 
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
                userId: session.user.id, 
                amountStatus: "PENDING", 
                quizStatus: "DRAFTED"
             }, 
             select: { 
                id: true,
                title: true, 
                CreatedAt: true, 
                amount: true, 
                amountStatus: true, 
                templateId: true
             }
        })

        return { 
            message: "successfully fetched the detailes", 
            status: 200, 
            data: response
        }

    }catch(e) { 
        console.log(e)
        return { 
            message : 'something went wrong', 
            status: 500
        }
    } 
}