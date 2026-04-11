import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Zap, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple top bar */}
      <header className="border-b border-border bg-card/50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-primary-foreground fill-current" />
          </div>
          TipMark
        </Link>
        <div className="text-sm text-muted-foreground">{session.user.email}</div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Welcome */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
            <LayoutDashboard className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Creator Dashboard</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Your TipMark workspace. Set up your creator profile to start accepting SOL tips.
          </p>
        </div>

        {/* Setup steps */}
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              step: "01",
              title: "Connect your wallet",
              desc: "Link your Solana wallet to receive SOL tips directly.",
              cta: "Connect wallet",
              disabled: true,
            },
            {
              step: "02",
              title: "Create your profile",
              desc: "Set your username, bio, and profile picture.",
              cta: "Create profile",
              disabled: true,
            },
            {
              step: "03",
              title: "Share your page",
              desc: "Your page goes live at tipmark.xyz/yourname.",
              cta: "View page",
              disabled: true,
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4"
            >
              <span className="text-4xl font-black text-border/60 select-none">{item.step}</span>
              <div>
                <h3 className="font-semibold text-base mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <Button size="sm" disabled={item.disabled} className="mt-auto w-fit">
                {item.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          Creator profile setup is coming in the next sprint. Stay tuned!
        </p>
      </main>
    </div>
  )
}
