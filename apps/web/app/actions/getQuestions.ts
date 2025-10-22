"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import { prisma } from "@/index"

export async function getAllQuestion(templateId: string) {
    try {

        const session = await getServerSession(authOptions)
        if (!session) {
            return { 
                message: "please login first", 
                status: 401
            }
        }
        const response = await prisma.template.findFirst({ 
            where: { 
                userId: session.user.id, 
                id: templateId
            }, 
            select: { 
                title: true,
                Question: { 
                    select: { 
                        id: true, 
                        question: true, 
                        correctIndex: true,
                        options: { 
                            select : { 
                                id: true, 
                                index: true, 
                                text: true
                            }
                        }
                    }
                }
            }
        })

        return { 
            message: "ok", 
            status: 200, 
            data: response
        }

    } catch (e) {
        console.log(e)
        return {
            message: "something went wrong",
            status: 500
        }
    }
}