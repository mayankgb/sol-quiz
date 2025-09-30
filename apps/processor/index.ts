import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmRawTransaction, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import { prisma } from "db/client";
import bs58 from "bs58"
import Redis from "ioredis";
import dotenv from "dotenv"

dotenv.config()

console.log(process.env.SOLANA_PRIVATE_KEY)

const connection = new Connection("https://api.devnet.solana.com")
async function main() {
    const redis = new Redis({
        host: process.env.BROKERS, 
        password: process.env.PASSWORD, 
        port: 19373, 
        db: 0
    });
    const streamName = "quizchain";
    const groupName = "quiz1";
    const consumerName = "consumer1";

    async function setupStreamAndGroup() {
        try {
            await redis.xgroup("CREATE", streamName, groupName, "$", "MKSTREAM");
        } catch (err: any) {
            // Ignore BUSYGROUP error if group already exists
            if (!err?.message.includes("BUSYGROUP")) {
                console.error("Error creating stream group:", err);
            }
        }
    }

    await setupStreamAndGroup();

    while (true) {
        try {
            const response = await redis.xreadgroup(
                "GROUP",
                groupName,
                consumerName,
                "BLOCK",
                0,
                "STREAMS",
                streamName,
                ">"
            ) as [string, [string, string[]][]][] | null;

            if (!response) continue;

            for (const [, messages] of response) {
                for (const [messageId, fields] of messages) {
                    try {
                        const data = parseStreamData(fields);
                        console.log("Parsed Data:", data);

                        const result = await updateDbAndSendSol(
                            data.id || "",
                            data.walletAddress || "",
                            data.templateId || "",
                            data.name || "",
                            parseInt(data.points || "1000")
                        );

                        console.log(result)

                        await redis.xack(streamName, groupName, messageId);
                        console.log("Processed:", result);
                    } catch (err) {
                        console.error("Error processing message:", err);
                        return
                    }
                }
            }
        } catch (err) {
            console.error("Error reading from stream:", err);
            return
        }
    }
}

function parseStreamData(fields: string[]): Record<string, string> {
    const data: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
        const key = fields[i];
        const value = fields[i + 1];
        if (key && value !== undefined) {
            data[key] = value;
        }
    }
    return data;
}




async function updateDbAndSendSol(participantId: string, walletAddress: string, templateId: string, name: string, points: number) {

    const amount = await prisma.quiz.findFirst({
        where: {
            id: templateId
        },
        select: {
            amount: true
        }
    })

    if (!amount) {
        return
    }

    const updateQuiz = await prisma.quiz.update({
         where: { 
            id: templateId,
         }, 
         data: { 
            quizStatus: "ENDED"
         },
         select: { 
            id: true
         }
    })

    const response = await getUnsignedTransaction(walletAddress, amount.amount)
    const newParticipant = await prisma.participantRank.create({
        data: {
            rank: 1, 
            amount: amount.amount, 
            quizId: templateId,
            walletAddress: walletAddress,
            creditStatus: "PENDING",
            points: points,
            name: name,
            signature: response.signature
        }
    })
    await sendSignedTransaction(response.transaction, response.signature, response.blockhash, response.lastValidBlockHeight)

    return newParticipant.id
}

export async function sendSignedTransaction(rawTransaction: Buffer, signature: string, blockhash: string, lastValidBlockHeight: number) {
    const txid = await connection.sendRawTransaction(rawTransaction);
    
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });
  
    return txid;
  }
  

  export async function getUnsignedTransaction(to: string, amountSol: number) {
    const toPubkey = new PublicKey(to);
    const privateKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY!)

    const payer = Keypair.fromSecretKey(new Uint8Array(privateKey));
  
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey,
        lamports: amountSol,
      })
    );
  
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer.publicKey;
    transaction.sign(payer);
  
    const rawTransaction = transaction.serialize();
    const signature = bs58.encode(transaction.signature!);
  
    return {
      transaction: rawTransaction,
      signature,
      blockhash,
      lastValidBlockHeight
    };
  }


  main()
  