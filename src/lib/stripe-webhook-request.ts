import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import { processStripeWebhookEvent } from "@/lib/stripe-webhook"

export async function handleStripeWebhookPOST(
	req: Request,
	logLabel = "[stripe webhook]",
): Promise<Response> {
	const stripe = getStripe()
	const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
	if (!stripe || !secret) {
		return NextResponse.json(
			{ error: "Stripe webhook is not configured." },
			{ status: 500 },
		)
	}

	const rawBody = await req.text()
	const sig = req.headers.get("stripe-signature")
	if (!sig) {
		return NextResponse.json({ error: "Missing signature" }, { status: 400 })
	}

	let event: Stripe.Event
	try {
		event = stripe.webhooks.constructEvent(rawBody, sig, secret)
	} catch {
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
	}

	try {
		await processStripeWebhookEvent(event)
	} catch (e) {
		console.error(logLabel, e)
		return NextResponse.json({ error: "Handler failed" }, { status: 500 })
	}

	return NextResponse.json({ received: true })
}
