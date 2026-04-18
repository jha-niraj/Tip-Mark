import { notFound } from "next/navigation"
import { getPublicCreatorBySlug } from "@/actions/creator-profile"
import { PublicCreatorPage } from "@/components/public/public-creator-page"
import { Navbar } from "@/components/navbar"

type Props = { params: Promise<{ slug: string }> }

export default async function PublicCreatorPageRoute({ params }: Props) {
	const { slug } = await params
	const profile = await getPublicCreatorBySlug(slug)
	if (!profile) notFound()

	return (
		<>
			<Navbar />
			<PublicCreatorPage profile={profile} />
		</>
	)
}
