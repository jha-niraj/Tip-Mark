import Stripe from "stripe"

let stripeSingleton: Stripe | null = null

export function getStripe(): Stripe | null {
	const key = process.env.STRIPE_SECRET_KEY?.trim()
	if (!key) return null
	if (!stripeSingleton) {
		stripeSingleton = new Stripe(key, {
			// Keep in sync with `stripe` package (see node_modules/stripe/esm/apiVersion.js).
			apiVersion: "2026-03-25.dahlia",
			typescript: true,
		})
	}
	return stripeSingleton
}