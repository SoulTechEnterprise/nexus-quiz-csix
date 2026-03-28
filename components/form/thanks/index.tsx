import { sendGTMEvent } from "@next/third-parties/google"
import { BadgeCheck } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { get_auth_loan } from "@/app/actions/get-auth-loan"
import { send_loan } from "@/app/actions/send-loan"
import { send_message_to_whatsapp } from "@/app/actions/send-message-to-whatsapp"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { GoogleTagManager } from "@/enum/google-tag-manager"
import { Step } from "@/enum/step"
import { useLinkZustand } from "@/lib/zustand/link"
import { useSimulationZustand } from "@/lib/zustand/simulation"
import { useStepZustand } from "@/lib/zustand/step"
import { useUserAddressZustand } from "@/lib/zustand/user-address"
import { useUserBankZustand } from "@/lib/zustand/user-bank"
import { useUserIdentificationZustand } from "@/lib/zustand/user-identification"

export function Thanks() {
	const { data: getLink, update: setLink } = useLinkZustand()

	const { update } = useStepZustand()
	const { data: getUserIdentification } = useUserIdentificationZustand()
	const { data: getUserAddress } = useUserAddressZustand()
	const { data: getUserBank } = useUserBankZustand()

	const { data: getSimulation } = useSimulationZustand()

	useEffect(() => {
		;async () => {
			const proposal_number = await send_loan({
				id_simulation: getSimulation.simulation_id,
				client: {
					info: {
						document: getUserIdentification.document,
						phone: getUserIdentification.phone,
					},
					address: getUserAddress,
					bank: getUserBank,
				},
			})

			if (!proposal_number) {
				return
			}

			const { link } = await get_auth_loan(proposal_number)

			await send_message_to_whatsapp({
				name: getUserIdentification.name,
				phone: getUserIdentification.phone,
				link,
			})

			setLink(link, "")

			update(Step.THANKS)
		}
	}, [
		getSimulation,
		getUserIdentification,
		getUserAddress,
		getUserBank,
		setLink,
		update,
	])

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
						href={getLink.link || ""}
					>
						Autorizar empréstimo
					</Link>
				</Button>
			</CardContent>
		</Card>
	)
}
