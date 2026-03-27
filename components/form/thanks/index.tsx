import { sendGTMEvent } from "@next/third-parties/google"
import { BadgeCheck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { GoogleTagManager } from "@/enum/google-tag-manager"
import { useUserIdentificationZustand } from "@/lib/zustand/user-identification"

export function Thanks() {
	const { link: getUserIdentificationLink } = useUserIdentificationZustand()

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BadgeCheck className="size-4 text-blue-500" />{" "}
					{process.env.NEXT_PUBLIC_TITLE_CARD}
				</CardTitle>
				<CardDescription>
					Falta só mais um passo! Clique no botão para autorizar o empréstimo.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button
					onClick={() =>
						sendGTMEvent({ event: GoogleTagManager.WHATSAPP_CLICKED })
					}
				>
					<Link
						className="w-full h-full flex items-center justify-center"
						href={getUserIdentificationLink.url || ""}
					>
						Autorizar empréstimo
					</Link>
				</Button>
			</CardContent>
		</Card>
	)
}
