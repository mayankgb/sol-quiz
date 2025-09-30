import Google from "next-auth/providers/google"
import jwt, { Jwt } from "jsonwebtoken"
import { Account, User, Session, SessionStrategy } from "next-auth"
import { prisma } from "db/client"
import { JWT } from "next-auth/jwt"

export const authOptions = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!

        })
    ],

    secret: process.env.NEXTAUTH_SECRET!,
    callbacks: {
        async signIn({ user, account }: { user: User | null, account: Account | null }) {
            if (account?.provider === 'google') {
                if (!user) {
                    console.log("user is not present")
                    return false
                } else {
                    try {
                        const existingUser = await prisma.user.findUnique({
                            where: {
                                email: user.email
                            },
                            select: {
                                id: true,
                                email: true,
                            }
                        })

                        if (existingUser) {
                            const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET!)
                            user.email = existingUser.email
                            user.jwtToken = token
                            user.id = existingUser.id
                            return true
                        } else {
                            const newUser = await prisma.user.create({
                                data: {
                                    email: user.email,
                                },
                                select: {
                                    id: true,
                                    email: true
                                }
                            })
                            const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET!);
                            user.id = newUser.id;
                            user.jwtToken = token
                            return true
                        }
                    } catch (e) {
                        console.log(e)
                        return false
                    }
                }
            } else {
                return false
            }


        },

        async jwt({ token, user }: { token: JWT, user: User }) {
            if (user) {
                token.id = user.id
                token.email = user.email
                token.jwtToken = user.jwtToken
            }

            return token
        },

        async session({ session, token, user }: { session: Session, token: JWT, user: User }) {
            if (!token) {
                throw new Error("token is not present")
            }
            const newSession = session as Session
            newSession.user.email = token.email as string
            newSession.user.jwtToken = token.jwtToken as string
            newSession.user.id = token.id as string
            return newSession
        }

    },
    pages: {
        signIn: "/signin"
    },
    //      cookies: {
    //         sessionToken: {
    //           name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
    //           options: {
    //             httpOnly: true,
    //             sameSite: "lax",
    //             path: "/",
    //             secure: process.env.NODE_ENV === "production",
    //           },
    //         },
    //       },
    //       session: {
    //         strategy: "jwt" as SessionStrategy,
    //         maxAge: 60 * 60 * 24 * 3,
    //       },
}