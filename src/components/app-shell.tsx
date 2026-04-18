"use client"

import { MainSidebar } from "@/components/navigation/sidebar"
import { useSidebar } from "@/components/navigation/sidebarprovider"
import { cn } from "@/lib/utils"

/** Signed-in layout: sidebar + main content (landing-aligned spacing). */
export function AppShell({ children }: { children: React.ReactNode }) {
	const { isCollapsed } = useSidebar()

	return (
		<>
			<MainSidebar />
			<div
				className={cn(
					"min-h-screen flex-1 transition-[padding] duration-300",
					isCollapsed ? "lg:pl-[90px]" : "lg:pl-64",
				)}
			>
				{children}
			</div>
		</>
	)
}
