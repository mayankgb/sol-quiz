import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) { 
    const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET!})
    const {pathname} = req.nextUrl

    if (token) {
       if (pathname.startsWith("/signin")) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/dashboard`)
       } 
    }else { 
        if (pathname.startsWith("/signin")) {
           return NextResponse.next() 
        }else { 
            const redirectUrl = req.nextUrl.clone()
            redirectUrl.pathname = "/signin"
            redirectUrl.searchParams.set("callback", pathname)
            return NextResponse.redirect(redirectUrl)
        }
    }
}

export const config = { 
    matcher:["/dashboard", "/signin", "/create", "/create/:path*", "/quizes", "/winners/:path*", "/join/:path*" ]
}