"use server"

import { getServerSession } from "next-auth"
import type Stripe from "stripe"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TipRail, TipStatus } from "@/generated/prisma/client"
import { getAppUrl } from "@/lib/app-url"
import { getStripe } from "@/lib/stripe"

/** Stripe minimum charge in USD cents. */
const MIN_CUSTOM_CENTS = 50

export async function createTipCheckoutSession({
	creatorProfileId,
	campaignId,
	amountCents,
	creatorBadgeId,
}: {
	creatorProfileId: string
	campaignId?: string | null
	amountCents: number
	creatorBadgeId?: string | null
}) {
	const stripe = getStripe()
	if (!stripe) {
		return {
			ok: false as const,
			error: "Stripe is not configured. Add STRIPE_SECRET_KEY to your environment.",
		}
	}

	const session = await getServerSession(authOptions)
	if (!session?.user?.id) {
		return { ok: false as const, error: "Sign in to pay with a card." }
	}

	const profile = await prisma.creatorProfile.findUnique({
		where: { id: creatorProfileId },
	})
	if (!profile) {
		return { ok: false as const, error: "Creator not found." }
	}

	let finalCents = Math.round(amountCents)
	let resolvedBadgeId: string | null = null

	if (creatorBadgeId) {
		const badge = await prisma.creatorBadge.findFirst({
			where: { id: creatorBadgeId, creatorProfileId },
		})
		if (!badge) {
			return { ok: false as const, error: "That badge is not available." }
		}
		finalCents = badge.amountCents
		resolvedBadgeId = badge.id
	} else if (finalCents < MIN_CUSTOM_CENTS) {
		return {
			ok: false as const,
			error: `Minimum card tip is $${(MIN_CUSTOM_CENTS / 100).toFixed(2)}.`,
		}
	}

	if (campaignId) {
		const camp = await prisma.campaign.findFirst({
			where: { id: campaignId, creatorProfileId },
		})
		if (!camp) {
			return { ok: false as const, error: "Campaign not found." }
		}
	}

	const tip = await prisma.tip.create({
		data: {
			rail: TipRail.STRIPE,
			creatorProfileId,
			supporterUserId: session.user.id,
			campaignId: campaignId ?? undefined,
			creatorBadgeId: resolvedBadgeId,
			amountCents: finalCents,
			currency: "usd",
			status: TipStatus.PENDING,
		},
	})

	const base = getAppUrl()
	const badgeRow = resolvedBadgeId
		? await prisma.creatorBadge.findUnique({ where: { id: resolvedBadgeId } })
		: null

	const productName = badgeRow
		? `${badgeRow.emoji ? `${badgeRow.emoji} ` : ""}${badgeRow.name}`
		: `Tip — ${profile.displayName ?? profile.slug}`

	const checkoutParams: Stripe.Checkout.SessionCreateParams = {
		mode: "payment",
		line_items: [
			{
				quantity: 1,
				price_data: {
					currency: "usd",
					unit_amount: finalCents,
					product_data: {
						name: productName,
						description: profile.bio?.slice(0, 120) ?? undefined,
					},
				},
			},
		],
		success_url: `${base}/u/${profile.slug}?tip=success`,
		cancel_url: `${base}/u/${profile.slug}?tip=canceled`,
		client_reference_id: tip.id,
		metadata: {
			tipId: tip.id,
			creatorProfileId,
			supporterUserId: session.user.id,
		},
		payment_intent_data: {
			metadata: { tipId: tip.id },
		},
	}

	if (profile.stripeConnectAccountId && profile.stripeChargesEnabled) {
		checkoutParams.payment_intent_data = {
			...checkoutParams.payment_intent_data,
			transfer_data: {
				destination: profile.stripeConnectAccountId,
			},
		}
	}

	const checkoutSession = await stripe.checkout.sessions.create(checkoutParams)

	await prisma.tip.update({
		where: { id: tip.id },
		data: { stripeCheckoutSessionId: checkoutSession.id },
	})

	if (!checkoutSession.url) {
		await prisma.tip.update({
			where: { id: tip.id },
			data: { status: TipStatus.FAILED },
		})
		return { ok: false as const, error: "Could not start checkout." }
	}

	return { ok: true as const, url: checkoutSession.url }
}
