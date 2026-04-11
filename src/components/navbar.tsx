"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
	Sheet, SheetContent, SheetTrigger
} from "@/components/ui/sheet"
import { SignInDialog } from "@/components/auth/sign-in-dialog"
import {
	Menu, Moon, Sun, Zap, LogOut, LayoutDashboard
} from "lucide-react"

const navLinks = [
	{ label: "How it works", href: "#how-it-works" },
	{ label: "Badge tiers", href: "#badge-tiers" },
	{ label: "Compare", href: "#compare" },
]

export function Navbar() {
	const { data: session } = useSession()
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const [scrolled, setScrolled] = useState(false)
	const [signInOpen, setSignInOpen] = useState(false)
	const [mobileOpen, setMobileOpen] = useState(false)

	useEffect(() => {
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
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled
					? "bg-background/80 backdrop-blur-xl"
					: "bg-transparent"
					}`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-14">
						<Link href="/" className="flex items-center gap-2 font-bold text-lg group">
							<div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
								<Zap className="h-3.5 w-3.5 text-primary-foreground fill-current" />
							</div>
							TipMark
						</Link>
						<div className="hidden md:flex items-center gap-0.5">
							{
								navLinks.map((link) => (
									<Link
										key={link.href}
										href={link.href}
										className="px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
									>
										{link.label}
									</Link>
								))
							}
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
									theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
								) : <div className="h-4 w-4" />}
							</Button>

							{
								session ? (
									<div className="hidden md:flex items-center gap-1">
										<Link href="/home">
											<Button variant="ghost" size="sm" className="gap-1.5 text-sm h-8">
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
										className="hidden md:flex h-8 text-sm"
										onClick={() => setSignInOpen(true)}
									>
										Sign in
									</Button>
								)
							}

							<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
								<SheetTrigger asChild>
									<Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
										<Menu className="h-4 w-4" />
									</Button>
								</SheetTrigger>
								<SheetContent side="right" className="w-64">
									<div className="flex flex-col gap-1 mt-6">
										{
											navLinks.map((link) => (
												<Link
													key={link.href}
													href={link.href}
													onClick={() => setMobileOpen(false)}
													className="px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
												>
													{link.label}
												</Link>
											))
										}
										<div className="border-t border-border my-2" />
										{
											session ? (
												<>
													<Link href="/home" onClick={() => setMobileOpen(false)}
														className="px-3 py-2.5 text-sm flex items-center gap-2">
														<LayoutDashboard className="h-4 w-4" /> Home
													</Link>
													<button onClick={() => signOut({ callbackUrl: "/" })}
														className="px-3 py-2.5 text-sm text-muted-foreground flex items-center gap-2 text-left">
														<LogOut className="h-4 w-4" /> Sign out
													</button>
												</>
											) : (
												<Button className="mx-0 mt-1" onClick={() => { setMobileOpen(false); setSignInOpen(true) }}>
													Sign in
												</Button>
											)
										}
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
			</motion.nav>

			<SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
		</>
	)
}