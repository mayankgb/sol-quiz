import type { NextFunction , Request, Response} from "express";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { idText } from "typescript";

dotenv.config()

export default function middleware(req: Request, res: Response, next: NextFunction) { 
    try { 

        const header = req.headers.authorization
        if (!header) {
            res.status(401).json({ 
                message: "unauthorised access"
            })
            return
        }

        const token = jwt.verify(header, process.env.JWT_SECRET!) as { id: string}
        res.locals.userid = token.id

        next()
        
    }catch(e) {
        console.log(e)
        res.status(500).json({ 
            message: "something went wrong"
        })
        return 
    }
}