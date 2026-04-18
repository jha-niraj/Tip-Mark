"use server"

import { Resend } from "resend"
import { prisma } from "@/lib/prisma"

const resend = new Resend(process.env.RESEND_API_KEY)

function generateOTP(): string {
	return Math.floor(100000 + Math.random() * 900000).toString()
}

export type SendSignInOtpResult =
	| { ok: true }
	| { ok: false; error: string }

export async function sendSignInOtp(email: string): Promise<SendSignInOtpResult> {
	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return { ok: false, error: "Invalid email address" }
	}

	try {
		const code = generateOTP()
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

		await prisma.otp.create({
			data: { email, code, expiresAt },
		})

		await resend.emails.send({
			from: process.env.RESEND_FROM_EMAIL as string,
			to: email,
			subject: `${code} — your TipMark sign-in code`,
			html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fffbf5; margin: 0; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; border: 1px solid #e7e0d8;">
              <div style="margin-bottom: 24px;">
                <span style="font-size: 24px; font-weight: 700; color: #1c1917;">⚡ TipMark</span>
              </div>
              <h1 style="font-size: 22px; font-weight: 600; color: #1c1917; margin: 0 0 8px;">Your sign-in code</h1>
              <p style="color: #78716c; margin: 0 0 32px;">Enter this code to sign in to TipMark. It expires in 10 minutes.</p>
              <div style="background: #fef3c7; border: 2px solid #d97706; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                <span style="font-size: 40px; font-weight: 700; letter-spacing: 0.2em; color: #92400e;">${code}</span>
              </div>
              <p style="color: #a8a29e; font-size: 13px; margin: 0;">If you didn&apos;t request this, you can safely ignore this email.</p>
            </div>
          </body>
        </html>
      `,
		})

		return { ok: true }
	} catch {
		return { ok: false, error: "Failed to send code. Try again." }
	}
}