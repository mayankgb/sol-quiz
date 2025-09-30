"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Instrument_Serif } from "next/font/google"
import google from "@/public/google.svg"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

const instrument = Instrument_Serif({
    subsets: ['latin'],
    weight: ['400']
}) 

export default function SignInPage() {

    const searchParams = useSearchParams()
    const url = searchParams.get("callback") ??  "/dashboard"
    const [isDisable, setIsDisable] = useState(false)
    console.log(url)

    const handleClick = async () => {
        setIsDisable(true)
        toast("signing you...")
        await signIn("google", {callbackUrl:url})
        setIsDisable(false)
        toast("signed in")
        
    }

    return (
        <div className="flex flex-col h-screen justify-center items-center space-y-3">
            <div className="flex flex-col space-y-2">
                <div className="text-xs font-bold ">
                    QuizChain 
                </div>
                <div className={`${instrument.className} text-4xl`}>
                    Login
                </div>
            </div>
            <Button onClick={handleClick} variant={"outline"} disabled={isDisable} className="flex cursor-pointer items-center justify-center bg-gray-200 w-70 space-x-4 rounded-lg py-2">
                <Image src={google} className="w-4" alt="icon" />
                continue with google
            </Button>
        </div>
    )
}
