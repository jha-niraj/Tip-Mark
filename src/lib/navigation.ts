import type { LucideIcon } from "lucide-react"
import {
	Award, History, LayoutDashboard, LayoutTemplate, Megaphone, Settings
} from "lucide-react"

/** Matches Prisma `UserRole` — keep in sync with `prisma/schema.prisma`. */
export type TipMarkRole = "CREATOR" | "SUPPORTER"

export type NavigationItem = {
	name: string
	path: string
	icon: LucideIcon
	children?: NavigationItem[]
}

/**
 * Signed-in app navigation. See /srs/creator-plan.md and /srs/supporter-plan.md.
 */
export function getNavigationForRole(role: TipMarkRole): {
	primary: NavigationItem[]
	secondary: NavigationItem[]
} {
	if (role === "CREATOR") {
		return {
			primary: [
				{ name: "Home", path: "/home", icon: LayoutDashboard },
				{ name: "Studio", path: "/studio", icon: LayoutTemplate },
				{ name: "Badges", path: "/badges", icon: Award },
				{ name: "Campaigns", path: "/campaigns", icon: Megaphone },
			],
			secondary: [{ name: "Settings", path: "/settings", icon: Settings }],
		}
	}

	return {
		primary: [
			{ name: "Home", path: "/home", icon: LayoutDashboard },
			{ name: "Activity", path: "/activity", icon: History },
		],
		secondary: [],
	}
}