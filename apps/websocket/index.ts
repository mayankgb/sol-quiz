import { WebSocketServer } from "ws";
import express from "express"
import cors from "cors"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { RoomManager } from "./roomManager/roomManager";
import type { CustomWebsocket } from "./types/types";
import { adminRouter } from "./routes/admin";
import { userRouter } from "./routes/user";
import { serviceRouter } from "./routes/services";

dotenv.config()


const app = express()
const port = 8000
const server = app.listen(port, () => {
    console.log("app is working")
})

app.use(cors({
    origin: "*"
}))
app.use(express.json())
app.use("/admin", adminRouter)
app.use('/user', userRouter)
app.use("/service", serviceRouter)
const wss = new WebSocketServer({ server: server })

wss.on("connection", function (ws: CustomWebsocket) {

    ws.on('error', (e) => {
        console.log('error', e)
    })

    ws.on("message", async (data: any) => {
        try {
            const message = JSON.parse(data)

            console.log("websocket message", message)

            switch (message.request) {

                case "ping":
                    ws.send("pong")
                    break;

                case "join":
                    RoomManager.getInstance().join(message.participantId, ws, message.roomkey, message.roomId)
                    break;

                case "submission":
                    console.log("submission")
                    console.log("userId", ws.userId)
                    console.log("user room id", ws.roomId)
                    if (!ws.userId || !ws.roomId) {
                        ws.send(JSON.stringify({
                            type: "error",
                            message: "unauthorised access"
                        }))
                        return
                    }
                    RoomManager.getInstance().submission(ws.roomId, ws.userId, message.index, message.questionId, message.roomKey)
                    break;

                case "next":
                    console.log("next")
                    console.log("next admin id", ws.adminId)
                    console.log("next roomId", ws.roomId)
                    if (!ws.adminId || !ws.roomId) {
                        ws.send(JSON.stringify({
                            message: "unauthorised access",
                            type: "forbidden"
                        }))
                        return
                    }
                    RoomManager.getInstance().next(ws.roomId, ws.adminId)
                    break;

                case "adminJoin":
                    console.log("admin join")
                    const token = message.jwtToken
                    const decode = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
                    console.log(message)
                    console.log(decode)
                    RoomManager.getInstance().adminJoin(decode.id, ws)
                    break;

                default:
                    ws.send(JSON.stringify({
                        message: "invalid request",
                        status: 400
                    }))
            }
        } catch (e) {
            console.log(e)
            ws.send(JSON.stringify({
                message: "something went wrong"
            }))
        }



    })

    ws.on("close", async () => {
        await RoomManager.getInstance().disconnect(ws)
    })
    // ws.on('close')

})