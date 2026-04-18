"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { serializeTip } from "@/lib/serialize-tip"

export async function listSupporterActivityTips() {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) return []

	const tips = await prisma.tip.findMany({
		where: { supporterUserId: session.user.id },
		orderBy: { createdAt: "desc" },
		take: 200,
		include: { campaign: true, creatorProfile: true, supporter: true },
	})

	return tips.map((t) => serializeTip(t))
}
