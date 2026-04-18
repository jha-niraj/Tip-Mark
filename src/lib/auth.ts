import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { UserRole } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			id: "email-otp",
			name: "Email OTP",
			credentials: {
				email: { label: "Email", type: "email" },
				otp: { label: "Code", type: "text" },
				role: { label: "Role", type: "text" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.otp) return null

				const otpRecord = await prisma.otp.findFirst({
					where: {
						email: credentials.email,
						code: credentials.otp,
						used: false,
						expiresAt: { gt: new Date() },
					},
				})

				if (!otpRecord) return null

				await prisma.otp.update({
					where: { id: otpRecord.id },
					data: { used: true },
				})

				const desiredRole =
					credentials.role === "CREATOR" ? UserRole.CREATOR : UserRole.SUPPORTER

				let user = await prisma.user.findUnique({
					where: { email: credentials.email },
				})

				if (!user) {
					user = await prisma.user.create({
						data: { email: credentials.email, role: desiredRole },
					})
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name ?? null,
					role: user.role,
				}
			},
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60,
	},
	pages: {
		signIn: "/",
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id
				token.email = user.email
				token.role = user.role
			}
			return token
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string
				session.user.email = token.email as string
				session.user.role =
					(token.role as "SUPPORTER" | "CREATOR" | undefined) ?? "SUPPORTER"
			}
			return session
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
}
