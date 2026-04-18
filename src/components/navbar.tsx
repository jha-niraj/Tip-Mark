"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuthModal } from "@/components/auth/auth-modal-context"
import { Menu, Moon, Sun, Zap, LogOut, LayoutDashboard } from "lucide-react"

const navLinks = [
	{ label: "How it works", href: "#how-it-works" },
	{ label: "Badge tiers", href: "#badge-tiers" },
	{ label: "Compare", href: "#compare" },
]

export function Navbar() {
	const { data: session } = useSession()
	const { theme, setTheme } = useTheme()
	const { openSignIn } = useAuthModal()
	const [mounted, setMounted] = useState(false)
	const [scrolled, setScrolled] = useState(false)
	const [mobileOpen, setMobileOpen] = useState(false)

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount gate for theme toggle
		setMounted(true)
		const onScroll = () => setScrolled(window.scrollY > 16)
		window.addEventListener("scroll", onScroll, { passive: true })
		return () => window.removeEventListener("scroll", onScroll)
	}, [])

	return (
		<>
			<motion.nav
				initial={{ y: -16, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.4 }}
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
					scrolled ? "bg-background/80 backdrop-blur-xl" : "bg-transparent"
				}`}
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-14 items-center justify-between">
						<Link href="/" className="group flex items-center gap-2 text-lg font-bold">
							<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary transition-transform group-hover:scale-105">
								<Zap className="h-3.5 w-3.5 fill-current text-primary-foreground" />
							</div>
							TipMark
						</Link>
						<div className="hidden items-center gap-0.5 md:flex">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="rounded-md px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
								>
									{link.label}
								</Link>
							))}
						</div>
						<div className="flex items-center gap-1.5">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
								className="h-8 w-8"
								aria-label="Toggle theme"
							>
								{mounted ? (
									theme === "dark" ? (
										<Sun className="h-4 w-4" />
									) : (
										<Moon className="h-4 w-4" />
									)
								) : (
									<div className="h-4 w-4 animate-pulse" />
								)}
							</Button>

							{session ? (
								<div className="hidden items-center gap-1 md:flex">
									<Link href="/home">
										<Button variant="ghost" size="sm" className="h-8 gap-1.5 text-sm">
											<LayoutDashboard className="h-3.5 w-3.5" />
											Home
										</Button>
									</Link>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-muted-foreground"
										onClick={() => signOut({ callbackUrl: "/" })}
									>
										<LogOut className="h-3.5 w-3.5" />
									</Button>
								</div>
							) : (
								<Button
									size="sm"
									className="hidden h-8 text-sm md:flex"
									onClick={() => openSignIn("supporter")}
								>
									Sign in
								</Button>
							)}

							<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
								<SheetTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
										<Menu className="h-4 w-4" />
									</Button>
								</SheetTrigger>
								<SheetContent side="right" className="w-64">
									<div className="mt-6 flex flex-col gap-1">
										{navLinks.map((link) => (
											<Link
												key={link.href}
												href={link.href}
												onClick={() => setMobileOpen(false)}
												className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
											>
												{link.label}
											</Link>
										))}
										<div className="my-2 border-t border-border" />
										{session ? (
											<>
												<Link
													href="/home"
													onClick={() => setMobileOpen(false)}
													className="flex items-center gap-2 px-3 py-2.5 text-sm"
												>
													<LayoutDashboard className="h-4 w-4" /> Home
												</Link>
												<button
													type="button"
													onClick={() => signOut({ callbackUrl: "/" })}
													className="flex items-center gap-2 px-3 py-2.5 text-left text-sm text-muted-foreground"
												>
													<LogOut className="h-4 w-4" /> Sign out
												</button>
											</>
										) : (
											<Button
												className="mt-1"
												onClick={() => {
													setMobileOpen(false)
													openSignIn("supporter")
												}}
											>
												Sign in
											</Button>
										)}
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
			</motion.nav>
		</>
	)
}
