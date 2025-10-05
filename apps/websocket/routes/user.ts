import { Router } from "express";
import { RoomManager } from "../roomManager/roomManager";
import { createParticipantSchema } from "../types/types";
import { PublicKey } from "@solana/web3.js";

export const userRouter = Router()


userRouter.post("/getquiz", async (req, res) => {
    try {

        const body = req.body.roomKey

        const response = RoomManager.getInstance().hasRoom(body)

        res.json({
            roomId: response.roomId,
            roomType: response.roomType,
            message: response.message,
            status: response.status
        })
        return

    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: "something went wrong"
        })
        return
    }
})

userRouter.post("/create", async (req, res) => {
    const parsedInputs = createParticipantSchema.safeParse(req.body)

    console.log(parsedInputs.error)

    if (!parsedInputs.success || !parsedInputs.data) {
        res.status(400).json({
            message: "invalid inputs"
        })
        return
    }

    if (parsedInputs.data.walletAddress) {
        const response = isPublicKeyValid(parsedInputs.data.walletAddress)

        if (response.status > 200) {
            res.json({ 
                message: response.message, 
                status: response.status
            })
            return
        }
    }
    

    const response = RoomManager.getInstance().createUser(parsedInputs.data.name, parsedInputs.data.roomKey, parsedInputs.data.roomId, parsedInputs.data.walletAddress)

    if (response.status > 200) {
        res.status(response.status).json({
            message: response.message
        })
        return
    }

    res.status(response.status).json({
        message: response.message,
        participantId: response.participantd,
        roomId: response.roomId,
        roomKey: response.roomKey
    })
    return
})


function isPublicKeyValid(publicKey: string) { 
    try{ 

        const response = new PublicKey(publicKey)

        return { 
            message: "valid key",
            status: 200, 
            publicKey
        }

    }catch(e){ 
        console.log(e)
        return { 
            status: 400, 
            message: "invalid public key"
        }
    }
}