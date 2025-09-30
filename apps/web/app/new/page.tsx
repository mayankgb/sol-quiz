"use client"

import {useSession} from "next-auth/react"
import { authOptions } from "../lib/auth";

export default function New() { 
    const sesssion = useSession()
    return( 
        <div>
            {JSON.stringify(sesssion.data)}
        </div>
    );
}