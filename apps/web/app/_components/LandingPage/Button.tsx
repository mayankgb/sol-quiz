"use client"
import { useSession } from "next-auth/react"
import Link from "next/link"

export function HomeButton() {
    const session = useSession()

    return (
        <Link href={session.data? "/dashboard" : "/signin"} className="hidden md:block px-6 py-2 bg-purple-700 text-white font-medium rounded-full hover:bg-purple-800 transition-colors">
            {session.data ? "Dashboard" : "signin"}
          </Link>
    )
}