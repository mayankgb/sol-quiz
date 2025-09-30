"use client"

import { Suspense } from "react"
import SignInPage from "../_components/signinPage/siginInPage"


export default function SignIn() {
    return (
        <Suspense> 
            <SignInPage/>
        </Suspense>
    )
}