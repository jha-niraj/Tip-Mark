/**
 * Canonical public URL for redirects (Stripe success/cancel, emails).
 */
export function getAppUrl(): string {
	const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim()
	if (explicit) return explicit.replace(/\/$/, "")
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`
	}
	return "http://localhost:3000"
}
