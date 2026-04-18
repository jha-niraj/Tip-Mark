import Link from "next/link"
import { 
	Zap 
} from "lucide-react"

const links = {
	Product: [
		{ label: "How it works", href: "#how-it-works" },
		{ label: "Badge tiers", href: "#badge-tiers" },
		{ label: "Compare", href: "#compare" },
	],
	Source: [{ label: "GitHub", href: "https://github.com/jha-niraj/Tip-Mark" }],
}

export function Footer() {
	return (
		<footer className="border-t border-border">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
					<div className="col-span-2 md:col-span-1">
						<Link href="/" className="flex items-center gap-2 font-bold text-base mb-3 w-fit">
							<div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
								<Zap className="h-3 w-3 text-primary-foreground fill-current" />
							</div>
							TipMark
						</Link>
						<p className="text-sm text-muted-foreground leading-relaxed max-w-48">
							The tip jar that leaves a permanent mark. Built on Solana.
						</p>
					</div>

					{
						Object.entries(links).map(([cat, items]) => (
							<div key={cat}>
								<p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">{cat}</p>
								<ul className="space-y-2">
									{
										items.map((item) => (
											<li key={item.label}>
												<Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
													{item.label}
												</Link>
											</li>
										))
									}
								</ul>
							</div>
						))
					}
				</div>
				<div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
					<p>© 2026 TipMark. Open-source, zero fees.</p>
					<p>
						Built for{" "}
						<span className="text-primary font-medium">Colosseum Frontier 2026</span>
						{" "}on Solana ◎
					</p>
				</div>
				<div className="w-full border-t border-white/5 pt-2 pointer-events-none select-none overflow-hidden">
					<h1 className="text-[16vw] leading-[0.75] font-display text-center tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-b from-neutral-300/40 dark:from-white/[0.1] to-transparent">
						TIPMARK
					</h1>
				</div>
			</div>
		</footer>
	)
}
