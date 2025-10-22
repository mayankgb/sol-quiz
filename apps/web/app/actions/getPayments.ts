"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import { prisma } from "@/prisma"


export async function getAllPayments(){ 
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
                userId: session.user.id
            }, 
            select: {
                id: true,
                amountStatus: true,
                title: true, 
                PendingPayments: {
                    select: {
                        id: true, 
                        signature: true, 
                        status: true,
                        createdAt: true
                    }
                }
            }
        })

        if (!response ) {
            return { 
                message: 'no payments present', 
                status: 400
            }
        }

        return { 
            message: "fetched", 
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