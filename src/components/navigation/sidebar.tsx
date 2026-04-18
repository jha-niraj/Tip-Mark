"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { toast } from "sonner"
import {
	User, LogOut, ChevronLeft, ChevronRight, Zap, Menu, X
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
	Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSidebar } from "@/components/navigation/sidebarprovider"
import {
	getNavigationForRole, type NavigationItem, type TipMarkRole,
} from "@/lib/navigation"

export function MainSidebar() {
	const {
		isCollapsed,
		setIsCollapsed,
		isMobileOpen,
		setIsMobileOpen,
	} = useSidebar()
	const pathname = usePathname()
	const router = useRouter()
	const { data: session, status } = useSession()
	const profileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

	const userRole = (session?.user?.role as TipMarkRole | undefined) ?? "SUPPORTER"
	const navigation = useMemo(
		() => getNavigationForRole(userRole),
		[userRole],
	)
	const navItems = navigation.primary
	const secondaryItems = navigation.secondary

	useEffect(() => {
		const id = requestAnimationFrame(() => setIsMobileOpen(false))
		return () => cancelAnimationFrame(id)
	}, [pathname, setIsMobileOpen])

	useEffect(() => {
		return () => {
			if (profileTimeoutRef.current) {
				clearTimeout(profileTimeoutRef.current)
			}
		}
	}, [])

	const handleProfileMouseEnter = () => {
		if (profileTimeoutRef.current) {
			clearTimeout(profileTimeoutRef.current)
		}
		setProfileDropdownOpen(true)
	}

	const handleProfileMouseLeave = () => {
		if (profileTimeoutRef.current) {
			clearTimeout(profileTimeoutRef.current)
		}
		profileTimeoutRef.current = setTimeout(() => {
			setProfileDropdownOpen(false)
		}, 150)
	}

	const handleSignOut = async () => {
		await signOut({ callbackUrl: "/" })
		setProfileDropdownOpen(false)
		toast.success("Signed out", {
			description: "You have been signed out successfully.",
		})
	}

	const renderNavItem = useCallback(
		(item: NavigationItem) => {
			const isActive =
				pathname === item.path || pathname.startsWith(`${item.path}/`)
			const Icon = item.icon

			const linkContent = (
				<Link
					href={item.path}
					className={cn(
						"flex cursor-pointer items-center gap-3 rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
						isActive
							? "bg-primary text-primary-foreground shadow-sm"
							: "text-muted-foreground hover:bg-accent hover:text-foreground",
						isCollapsed && "justify-center px-3",
					)}
				>
					<Icon className="h-5 w-5 shrink-0" />
					{!isCollapsed && (
						<span className="overflow-hidden whitespace-nowrap">{item.name}</span>
					)}
				</Link>
			)

			return isCollapsed ? (
				<Tooltip key={item.path}>
					<TooltipTrigger asChild>{linkContent}</TooltipTrigger>
					<TooltipContent
						side="right"
						className="border-border bg-popover text-popover-foreground"
					>
						{item.name}
					</TooltipContent>
				</Tooltip>
			) : (
				<div key={item.path}>{linkContent}</div>
			)
		},
		[isCollapsed, pathname],
	)

	const renderSidebarContent = () => (
		<>
			<div
				className={cn(
					"relative flex items-center border-b border-border bg-background/80 px-5 py-5 backdrop-blur-sm",
					isCollapsed ? "justify-center" : "gap-3",
				)}
			>
				<Link
					href="/home"
					className={cn(
						"group flex items-center gap-2.5 font-bold text-foreground",
						!isCollapsed && "min-w-0",
					)}
				>
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary transition-transform group-hover:scale-105">
						<Zap className="h-4 w-4 fill-current text-primary-foreground" />
					</div>
					{!isCollapsed && (
						<div className="hidden min-w-0 flex-1 text-left lg:block">
							<h1 className="truncate text-lg font-bold tracking-tight">TipMark</h1>
							<p className="truncate text-xs text-muted-foreground">
								Tips that leave a mark
							</p>
						</div>
					)}
				</Link>
				<button
					type="button"
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="absolute top-5 -right-3 z-50 hidden rounded-full border border-border bg-background/95 p-1 shadow-md backdrop-blur-sm transition-colors hover:bg-accent lg:block"
					aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
				>
					{isCollapsed ? (
						<ChevronRight className="h-4 w-4 text-foreground" />
					) : (
						<ChevronLeft className="h-4 w-4 text-foreground" />
					)}
				</button>
			</div>
			<ScrollArea className="min-h-0 flex-1">
				<nav className="space-y-0.5 px-3 py-4">
					{navItems.map((item) => renderNavItem(item))}
					{secondaryItems.length > 0 && (
						<>
							<div className="pb-2 pt-5">
								{!isCollapsed && (
									<p className="px-3.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
										Account
									</p>
								)}
							</div>
							{secondaryItems.map((item) => renderNavItem(item))}
						</>
					)}
				</nav>
			</ScrollArea>
			<div className="mt-auto shrink-0 border-t border-border">
				<div className="px-4 py-3">
					<ThemeToggle />
				</div>
				{status === "authenticated" && session ? (
					<div
						className="relative px-3 py-2"
						onMouseEnter={handleProfileMouseEnter}
						onMouseLeave={handleProfileMouseLeave}
					>
						<button
							type="button"
							className={cn(
								"flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent",
								isCollapsed && "justify-center",
							)}
						>
							{session.user.image ? (
								<Image
									className="h-8 w-8 shrink-0 rounded-full border border-border"
									src={session.user.image}
									alt={`Profile picture of ${session.user.name || "user"}`}
									width={32}
									height={32}
								/>
							) : (
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-primary">
									<span className="text-xs font-bold text-primary-foreground">
										{session.user.name?.[0] ?? "U"}
									</span>
								</div>
							)}
							{!isCollapsed && (
								<div className="hidden min-w-0 flex-1 text-left lg:block">
									<p className="truncate text-sm font-bold text-foreground">
										{session.user.name ?? "User"}
									</p>
									<p className="truncate font-mono text-[10px] capitalize text-muted-foreground">
										{session.user.role.toLowerCase()}
									</p>
								</div>
							)}
						</button>
						{profileDropdownOpen && (
							<div
								className="absolute bottom-0 left-full z-50 ml-1 w-64 overflow-hidden rounded-lg border border-border bg-popover shadow-2xl"
								onMouseEnter={handleProfileMouseEnter}
								onMouseLeave={handleProfileMouseLeave}
							>
								<div className="border-b border-border p-3">
									<div className="flex items-center gap-3">
										{session.user.image ? (
											<Image
												className="h-10 w-10 rounded-full border border-border"
												src={session.user.image}
												alt={`Profile picture of ${session.user.name || "user"}`}
												width={40}
												height={40}
											/>
										) : (
											<div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-primary">
												<span className="text-lg font-bold text-primary-foreground">
													{session.user.name?.[0] ?? "U"}
												</span>
											</div>
										)}
										<div className="min-w-0 flex-1">
											<h3 className="truncate text-sm font-bold text-foreground">
												{session.user.name ?? "User"}
											</h3>
											<p className="truncate font-mono text-xs text-muted-foreground">
												{session.user.email}
											</p>
										</div>
									</div>
								</div>
								<div className="p-2">
									<button
										type="button"
										onClick={() => router.push("/home")}
										className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
									>
										<User className="h-4 w-4" />
										<span className="font-medium text-foreground">Account</span>
									</button>
									<button
										type="button"
										onClick={handleSignOut}
										className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
									>
										<LogOut className="h-4 w-4" />
										Sign out
									</button>
								</div>
							</div>
						)}
					</div>
				) : (
					<div className="px-3 py-2">
						<button
							type="button"
							onClick={() => router.push("/")}
							className={cn(
								"group flex w-full items-center rounded-lg p-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground",
								isCollapsed && "justify-center",
							)}
							title="Sign in"
						>
							<User className="h-5 w-5" />
							{!isCollapsed && <span className="ml-3">Sign in</span>}
						</button>
					</div>
				)}
			</div>
		</>
	)

	return (
		<TooltipProvider delayDuration={0}>
			<button
				type="button"
				onClick={() => setIsMobileOpen(!isMobileOpen)}
				className="fixed top-6 left-6 z-50 rounded-lg border border-border bg-background/80 p-2 text-foreground shadow-lg backdrop-blur-xl transition-all hover:bg-accent lg:hidden"
				aria-label="Toggle sidebar"
			>
				{isMobileOpen ? (
					<X className="h-6 w-6" />
				) : (
					<Menu className="h-6 w-6" />
				)}
			</button>
			<aside
				className={cn(
					"fixed top-0 left-0 z-40 hidden h-screen flex-col border-r border-border bg-background transition-all duration-300",
					isCollapsed ? "lg:w-[90px]" : "lg:w-64",
					"lg:flex lg:translate-x-0",
				)}
			>
				{renderSidebarContent()}
			</aside>
			<Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
				<SheetContent
					side="left"
					className="w-64 border-border bg-background p-0"
				>
					<div className="flex h-full flex-col">{renderSidebarContent()}</div>
				</SheetContent>
			</Sheet>
		</TooltipProvider>
	)
}
