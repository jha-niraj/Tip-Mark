"use server"

/**
 * Stripe Checkout session creation — wire `stripe` SDK when `STRIPE_SECRET_KEY` is set.
 */
export async function createTipCheckoutSession({
	creatorProfileId: _creatorId,
	campaignId: _campaignId,
	amountCents: _amountCents,
}: {
	creatorProfileId: string
	campaignId?: string | null
	amountCents: number
}) {
	void _creatorId
	void _campaignId
	void _amountCents

	if (!process.env.STRIPE_SECRET_KEY) {
		return {
			ok: false as const,
			error: "Stripe is not configured. Add STRIPE_SECRET_KEY to your environment.",
		}
	}

	return {
		ok: false as const,
		error: "Checkout session creation will be enabled in the next integration step.",
	}
}
