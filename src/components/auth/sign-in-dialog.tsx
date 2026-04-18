"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Mail, Zap, Heart, Sparkles } from "lucide-react"
import { sendSignInOtp } from "@/actions/auth/send-sign-in-otp"
import { cn } from "@/lib/utils"

export type SignInRole = "SUPPORTER" | "CREATOR"

interface SignInDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	/** Which tab to show when the dialog opens (Supporter is default). */
	defaultRole?: SignInRole
}

type Step = "email" | "otp"

const slideVariants = {
	enter: (direction: number) => ({
		x: direction > 0 ? 40 : -40,
		opacity: 0,
	}),
	center: { x: 0, opacity: 1 },
	exit: (direction: number) => ({
		x: direction < 0 ? 40 : -40,
		opacity: 0,
	}),
}

export function SignInDialog({
	open,
	onOpenChange,
	defaultRole = "SUPPORTER",
}: SignInDialogProps) {
	const router = useRouter()
	const [step, setStep] = useState<Step>("email")
	const [direction, setDirection] = useState(1)
	const [email, setEmail] = useState("")
	const [otp, setOtp] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [countdown, setCountdown] = useState(0)
	const [accountRole, setAccountRole] = useState<SignInRole>(defaultRole)
	const openedRef = useRef(false)

	useEffect(() => {
		if (open && !openedRef.current) {
			setAccountRole(defaultRole)
			openedRef.current = true
		}
		if (!open) {
			openedRef.current = false
		}
	}, [open, defaultRole])

	useEffect(() => {
		if (!open) {
			const t = setTimeout(() => {
				setStep("email")
				setEmail("")
				setOtp("")
				setError("")
				setCountdown(0)
			}, 300)
			return () => clearTimeout(t)
		}
	}, [open])

	useEffect(() => {
		if (countdown <= 0) return
		const id = setTimeout(() => setCountdown((c) => c - 1), 1000)
		return () => clearTimeout(id)
	}, [countdown])

	const goToOtp = () => {
		setDirection(1)
		setStep("otp")
	}

	const goToEmail = () => {
		setDirection(-1)
		setStep("email")
		setOtp("")
		setError("")
	}

	const handleSendOTP = async (e?: React.FormEvent) => {
		e?.preventDefault()
		setError("")
		setLoading(true)

		try {
			const result = await sendSignInOtp(email)

			if (!result.ok) {
				setError(result.error)
			} else {
				toast.success("Code sent! Check your inbox.")
				goToOtp()
				setCountdown(60)
			}
		} catch {
			setError("Something went wrong. Please try again.")
		} finally {
			setLoading(false)
		}
	}

	const handleVerifyOTP = async () => {
		if (otp.length < 6) return
		setError("")
		setLoading(true)

		const result = await signIn("email-otp", {
			email,
			otp,
			role: accountRole,
			redirect: false,
		})

		if (result?.error) {
			setError("Invalid or expired code. Try again.")
			setOtp("")
			setLoading(false)
		} else {
			toast.success(
				accountRole === "CREATOR"
					? "Welcome — creator account ready."
					: "Welcome to TipMark!",
			)
			onOpenChange(false)
			router.push("/home")
			router.refresh()
		}
	}

	useEffect(() => {
		if (otp.length === 6 && step === "otp" && !loading) {
			void handleVerifyOTP()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- verify once on 6 digits
	}, [otp])

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md overflow-hidden border-border p-0 shadow-2xl">
				<div className="bg-primary px-6 py-5">
					<div className="flex items-center gap-2 text-primary-foreground">
						<Zap className="h-5 w-5 fill-current" />
						<span className="font-bold text-lg">TipMark</span>
					</div>
				</div>

				<div className="border-b border-border bg-muted/30 px-4 py-3">
					<Tabs
						value={accountRole}
						onValueChange={(v) => setAccountRole(v as SignInRole)}
						className="w-full"
					>
						<TabsList className="grid w-full grid-cols-2 bg-muted/80">
							<TabsTrigger
								value="SUPPORTER"
								className="gap-1.5 data-[state=active]:bg-background"
							>
								<Heart className="h-3.5 w-3.5" />
								Supporter
							</TabsTrigger>
							<TabsTrigger
								value="CREATOR"
								className="gap-1.5 data-[state=active]:bg-background"
							>
								<Sparkles className="h-3.5 w-3.5" />
								Creator
							</TabsTrigger>
						</TabsList>
					</Tabs>
					<p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">
						{accountRole === "CREATOR"
							? "Receive tips and run campaigns — Solana + Stripe in one profile."
							: "Tip creators with SOL or card. No public page required."}
					</p>
				</div>

				<div className="relative min-h-[280px] overflow-hidden px-6 pb-6 pt-4">
					<AnimatePresence mode="wait" custom={direction}>
						{step === "email" ? (
							<motion.div
								key="email-step"
								custom={direction}
								variants={slideVariants}
								initial="enter"
								animate="center"
								exit="exit"
								transition={{ duration: 0.22, ease: "easeOut" }}
							>
								<DialogHeader className="mb-5">
									<DialogTitle className="text-xl">
										{accountRole === "CREATOR"
											? "Create your account"
											: "Sign in or sign up"}
									</DialogTitle>
									<DialogDescription>
										We&apos;ll email you a one-time code. New accounts use the tab
										above ({accountRole === "CREATOR" ? "Creator" : "Supporter"}).
									</DialogDescription>
								</DialogHeader>

								<form
									onSubmit={(ev) => void handleSendOTP(ev)}
									className="space-y-4"
								>
									<div className="space-y-1.5">
										<Label htmlFor="email">Email address</Label>
										<div className="relative">
											<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												id="email"
												type="email"
												placeholder="you@example.com"
												className="pl-9"
												value={email}
												onChange={(e) => {
													setEmail(e.target.value)
													setError("")
												}}
												required
												autoFocus
											/>
										</div>
									</div>

									{error && (
										<p className="text-sm text-destructive">{error}</p>
									)}

									<Button type="submit" className="w-full" disabled={loading}>
										{loading ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" /> Sending…
											</>
										) : (
											"Send code →"
										)}
									</Button>
								</form>

								<p className="mt-4 text-center text-xs text-muted-foreground">
									By continuing, you agree to our terms and privacy policy.
								</p>
							</motion.div>
						) : (
							<motion.div
								key="otp-step"
								custom={direction}
								variants={slideVariants}
								initial="enter"
								animate="center"
								exit="exit"
								transition={{ duration: 0.22, ease: "easeOut" }}
							>
								<DialogHeader className="mb-5">
									<button
										type="button"
										onClick={goToEmail}
										className="mb-2 -ml-0.5 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
									>
										<ArrowLeft className="h-3.5 w-3.5" />
										Back
									</button>
									<DialogTitle className="text-xl">Check your email</DialogTitle>
									<DialogDescription>
										We sent a 6-digit code to{" "}
										<span className="font-medium text-foreground">{email}</span>
									</DialogDescription>
								</DialogHeader>

								<div className="flex flex-col items-center gap-5">
									<InputOTP
										maxLength={6}
										value={otp}
										onChange={setOtp}
										disabled={loading}
									>
										<InputOTPGroup>
											<InputOTPSlot index={0} />
											<InputOTPSlot index={1} />
											<InputOTPSlot index={2} />
											<InputOTPSlot index={3} />
											<InputOTPSlot index={4} />
											<InputOTPSlot index={5} />
										</InputOTPGroup>
									</InputOTP>

									{error && (
										<p className="text-center text-sm text-destructive">{error}</p>
									)}

									{loading && (
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<Loader2 className="h-4 w-4 animate-spin" />
											Verifying…
										</div>
									)}

									<div className="text-center text-sm text-muted-foreground">
										{countdown > 0 ? (
											<span>Resend code in {countdown}s</span>
										) : (
											<button
												type="button"
												onClick={() => void handleSendOTP()}
												className={cn(
													"text-primary underline-offset-4 hover:underline",
													loading && "pointer-events-none opacity-50",
												)}
												disabled={loading}
											>
												Didn&apos;t receive it? Resend
											</button>
										)}
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</DialogContent>
		</Dialog>
	)
}
