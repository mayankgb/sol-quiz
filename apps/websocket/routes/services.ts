import { Router } from "express"
import { prisma } from "db/client"
import Redis from "ioredis"
export const serviceRouter = Router()
const redis = new Redis({
        host: process.env.BROKERS, 
        password: process.env.PASSWORD, 
        port: 19373, 
        db: 0
});

serviceRouter.get("/postgres", async (req, res) => { 
    try { 

        const id = await prisma.user.findFirst({
            where: { 
                email: "mayk03jun@gmail.com"
            },
             select: { 
                id: true
             }
        })

        res.json({ 
            message: id?.id
        })
        return

    }catch(e) { 
        console.log(e)
        res.status(500).json({ 
            message:"somethihn went wrong"
        })
        return
    }
})

serviceRouter.get("/redis", async (req , res) => { 
    try { 

        redis.xadd(
             "chain",
                "*",
                "data", "as"
        )
        res.json({ 
            message: "everything all right"
        })
        return
    }
    catch(e) { 
        console.log(e)
        res.status(500).json({ 
            message: "something went wrong"
        })
        return
    }
})