import { SidebarProvider } from "@/components/navigation/sidebarprovider"
import { AppShell } from "@/components/app-shell"

export default function AppLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen bg-background">
				<AppShell>{children}</AppShell>
			</div>
		</SidebarProvider>
	)
}
