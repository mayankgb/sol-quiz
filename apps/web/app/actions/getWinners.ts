"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import { prisma } from "db/client"
import { $Enums } from "../../../../packages/db/src/generated/prisma"

export async function getWinners( quizId: string ) { 

    try { 

        const session = await getServerSession(authOptions)

        if (!session) {
            return { 
                message: "please login first", 
                status: 401
            }
        }

        const response = await prisma.participantRank.findMany({ 
            where: { 
                quizId: quizId, 
                quiz: { 
                    userId: session.user.id, 
                    quizStatus: "ENDED", 
                }
            }, 
            orderBy: { rank: "asc"}, 
            take: 3,
            select: {
                 id: true, 
                 rank: true, 
                 quiz: { 
                    select: { 
                        id: true, 
                        title: true, 
                        isPrizePool: true, 
                        amount: true,
                        CreatedAt: true
                    }
                 }, 
                 signature: true, 
                 name: true
            }
        })

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