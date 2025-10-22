"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import { prisma } from "@/index"

export async function deleteQuestion(templateId: string, questionId: string) { 
    try { 

        const session = await getServerSession(authOptions)

        if (!session) {
            return {
                 message: "please login first", 
                 status: 401
            }
        }

        const response = await prisma.question.delete({
            where: { 
                templateId: templateId, 
                id: questionId
            }, 
            select: { 
                id: true
            }
        })

        return { 
            message: "deleted", 
            status: 200, 
            deletedId: response.id
        }

    }catch(e) {
        console.log(e)
        return { 
            message:"something went wrong", 
            status: 500
        }
    }
}