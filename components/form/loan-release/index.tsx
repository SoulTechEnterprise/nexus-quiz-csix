import { sendGTMEvent } from "@next/third-parties/google"
import { BadgeCheck } from "lucide-react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { GoogleTagManager } from "@/enum/google-tag-manager"
import { Step } from "@/enum/step"
import { useSimulationZustand } from "@/lib/zustand/simulation"
import { useStepZustand } from "@/lib/zustand/step"

export function LoanReleased() {
	const { update } = useStepZustand()
	const { data: getSimulation } = useSimulationZustand()

	useEffect(() => {
		sendGTMEvent({ event: GoogleTagManager.LOAN_OFFER_VIEWED })
	}, [])

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BadgeCheck className="size-4 text-blue-500" />{" "}
					{process.env.NEXT_PUBLIC_TITLE_CARD}
				</CardTitle>
				<CardDescription>
					Simulação concluída! Veja os detalhes e condições da sua proposta.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-2 [&_p]:text-muted-foreground">
					<div className="flex justify-between">
						<p>Valor máximo liberado:</p>
						<span>
							{new Intl.NumberFormat("pt-BR", {
								style: "currency",
								currency: "BRL",
							}).format(Number(getSimulation?.client_amount))}
						</span>
					</div>

					<div className="flex justify-between">
						<p>Prazo:</p>
						<span>
							{getSimulation?.installments}x de{" "}
							{new Intl.NumberFormat("pt-BR", {
								style: "currency",
								currency: "BRL",
							}).format(Number(getSimulation?.installment_amount))}
						</span>
					</div>

					<div className="flex justify-between">
						<p>Taxa de Juros:</p>
						<span>{getSimulation?.monthly_client_rate}% ao mês</span>
					</div>

					<div className="flex justify-between">
						<p>Primeira Parcela:</p>
						<span>{String(getSimulation?.first_due_date)}</span>
					</div>
				</div>
			</CardContent>
			<CardFooter className="grid gap-2">
				<Button
					onClick={() => {
						update(Step.USER_ADDRESS)
						sendGTMEvent({ event: GoogleTagManager.LOAN_OFFER_ACCEPTED })
					}}
				>
					Seguir com o proposta
				</Button>
				<Button
					onClick={() => {
						update(Step.CHANGE_LOAN)
						sendGTMEvent({ event: GoogleTagManager.LOAN_OFFER_CHANGE })
					}}
					variant="outline"
				>
					Ajustar a proposta
				</Button>
			</CardFooter>
		</Card>
	)
}
