import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
	getCreatorDashboardData,
	getSupporterDashboardData,
} from "@/actions/dashboard"
import { CreatorHome } from "@/components/home/creator-home"
import { SupporterHome } from "@/components/home/supporter-home"

export default async function HomePage() {
	const session = await getServerSession(authOptions)
	if (!session) redirect("/")

	if (session.user.role === "CREATOR") {
		const data = await getCreatorDashboardData()
		if (!data) redirect("/")
		return <CreatorHome initial={data} />
	}

	const data = await getSupporterDashboardData()
	if (!data) redirect("/")
	return <SupporterHome initial={data} />
}
