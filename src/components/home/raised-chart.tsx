"use client"

import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"

function formatUsd(cents: number) {
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
		cents / 100,
	)
}

type Point = { day: string; cents: number }

export function RaisedChart({ data }: { data: Point[] }) {
	const hasAny = data.some((d) => d.cents > 0)

	return (
		<div className="h-[220px] w-full">
			{!hasAny ? (
				<div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
					No card tips in the last 30 days — your graph will fill in as supporters tip.
				</div>
			) : (
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
						<defs>
							<linearGradient id="fillRaised" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
								<stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
						<XAxis
							dataKey="day"
							tick={{ fontSize: 10 }}
							tickFormatter={(v: string) => {
								const [, m, d] = v.split("-")
								return `${m}/${d}`
							}}
							stroke="hsl(var(--muted-foreground))"
						/>
						<YAxis
							tick={{ fontSize: 10 }}
							tickFormatter={(v: number) => formatUsd(v)}
							stroke="hsl(var(--muted-foreground))"
							width={52}
						/>
						<Tooltip
							content={({ active, payload }) => {
								if (!active || !payload?.length) return null
								const row = payload[0].payload as Point
								return (
									<div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
										<p className="font-medium">{row.day}</p>
										<p className="mt-1 text-muted-foreground">
											Card tips: {formatUsd(row.cents)}
										</p>
									</div>
								)
							}}
						/>
						<Area
							type="monotone"
							dataKey="cents"
							name="Raised (USD)"
							stroke="hsl(var(--primary))"
							fill="url(#fillRaised)"
							strokeWidth={2}
							// Recharts expects numbers; we store cents.
							baseValue={0}
						/>
					</AreaChart>
				</ResponsiveContainer>
			)}
		</div>
	)
}
