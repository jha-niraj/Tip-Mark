import { handleStripeWebhookPOST } from "@/lib/stripe-webhook-request"

/** Production-style path: `/api/webhooks/stripe` */
export const runtime = "nodejs"

export async function POST(req: Request) {
	return handleStripeWebhookPOST(req)
}
