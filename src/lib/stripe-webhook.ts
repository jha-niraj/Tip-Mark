import type Stripe from "stripe"
import { TipRail, TipStatus } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

/**
 * Applies supported Stripe webhook events to our `Tip` ledger.
 * Idempotent: repeated events for the same tip are safe (status checks / updateMany).
 */
export async function processStripeWebhookEvent(event: Stripe.Event): Promise<void> {
	switch (event.type) {
		case "checkout.session.completed": {
			const session = event.data.object as Stripe.Checkout.Session
			const tipId = session.metadata?.tipId ?? session.client_reference_id
			if (!tipId) return

			const pi =
				typeof session.payment_intent === "string"
					? session.payment_intent
					: session.payment_intent?.id

			await prisma.tip.updateMany({
				where: {
					id: tipId,
					status: TipStatus.PENDING,
				},
				data: {
					status: TipStatus.SUCCEEDED,
					...(pi ? { stripePaymentIntentId: pi } : {}),
				},
			})
			return
		}
		case "checkout.session.expired": {
			const session = event.data.object as Stripe.Checkout.Session
			const tipId = session.metadata?.tipId ?? session.client_reference_id
			if (!tipId) return
			await prisma.tip.updateMany({
				where: { id: tipId, status: TipStatus.PENDING },
				data: { status: TipStatus.CANCELED },
			})
			return
		}
		case "payment_intent.succeeded": {
			const pi = event.data.object as Stripe.PaymentIntent
			const tipId = pi.metadata?.tipId
			if (!tipId) return
			await prisma.tip.updateMany({
				where: {
					id: tipId,
					status: TipStatus.PENDING,
					rail: TipRail.STRIPE,
				},
				data: {
					status: TipStatus.SUCCEEDED,
					stripePaymentIntentId: pi.id,
				},
			})
			return
		}
		case "payment_intent.payment_failed": {
			const pi = event.data.object as Stripe.PaymentIntent
			const tipId = pi.metadata?.tipId
			if (!tipId) return
			await prisma.tip.updateMany({
				where: { id: tipId, status: TipStatus.PENDING },
				data: { status: TipStatus.FAILED },
			})
			return
		}
		default:
			return
	}
}