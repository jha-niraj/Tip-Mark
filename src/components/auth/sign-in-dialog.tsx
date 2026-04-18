"use client"

import { useState, useEffect } from "react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Mail, Zap } from "lucide-react"
import { sendSignInOtp } from "@/actions/auth/send-sign-in-otp"

interface SignInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [direction, setDirection] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("email")
        setEmail("")
        setOtp("")
        setError("")
        setCountdown(0)
      }, 300)
    }
  }, [open])

  // Countdown for resend
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
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
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid or expired code. Try again.")
      setOtp("")
      setLoading(false)
    } else {
      toast.success("Welcome to TipMark!")
      onOpenChange(false)
      router.push("/home")
    }
  }

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && step === "otp" && !loading) {
      handleVerifyOTP()
    }
  }, [otp]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0">
        {/* Header strip */}
        <div className="bg-primary px-6 py-5">
          <div className="flex items-center gap-2 text-primary-foreground">
            <Zap className="h-5 w-5 fill-current" />
            <span className="font-bold text-lg">TipMark</span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 min-h-[280px] relative overflow-hidden">
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
                  <DialogTitle className="text-xl">Welcome back</DialogTitle>
                  <DialogDescription>
                    Enter your email and we&apos;ll send a one-time code. No password needed.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={(ev) => void handleSendOTP(ev)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                    ) : (
                      "Send code →"
                    )}
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By signing in, you agree to our terms and privacy policy.
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
                    onClick={goToEmail}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 -ml-0.5"
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
                    <p className="text-sm text-destructive text-center">{error}</p>
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
                        className="text-primary hover:underline underline-offset-4"
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
