import { handleStripeWebhookPOST } from "@/lib/stripe-webhook-request"

/**
 * Alias for Stripe CLI: `stripe listen --forward-to localhost:<port>/api/webhook`
 * (same handler as `/api/webhooks/stripe`).
 */
export const runtime = "nodejs"

export async function POST(req: Request) {
	return handleStripeWebhookPOST(req, "[stripe webhook /api/webhook]")
}
