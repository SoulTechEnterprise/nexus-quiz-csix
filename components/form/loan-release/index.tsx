import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleTagManager } from "@/enum/google-tag-manager";
import { Step } from "@/enum/step";
import { useStepZustand } from "@/lib/zustand/step";
import { sendGTMEvent } from "@next/third-parties/google";
import { BadgeCheck } from "lucide-react";
import { useEffect } from "react";

export function LoanReleased() {
    const { update } = useStepZustand()

    useEffect(() => {
        sendGTMEvent({ event: GoogleTagManager.LOAN_OFFER_VIEWED })
    }, [])

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BadgeCheck className="size-4 text-blue-500" /> {process.env.NEXT_PUBLIC_TITLE_CARD}</CardTitle>
                <CardDescription>Simulação concluída! Veja os detalhes e condições da sua proposta.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2 [&_p]:text-muted-foreground">
                    <div className="flex justify-between">
                        <p>Valor máximo liberado:</p>
                        <span>R$ 1.000,00</span>
                    </div>

                    <div className="flex justify-between">
                        <p>Prazo:</p>
                        <span>48x de R$ 93,48</span>
                    </div>

                    <div className="flex justify-between">
                        <p>Taxa de Juros:</p>
                        <span>1,88% ao mês</span>
                    </div>

                    <div className="flex justify-between">
                        <p>Primeira Parcela:</p>
                        <span>01/02/2026</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="grid gap-2">
                <Button onClick={() => {update(Step.USER_ADDRESS); sendGTMEvent({ event: GoogleTagManager.LOAN_OFFER_ACCEPTED })}}>Seguir com o proposta</Button>
                <Button onClick={() => {update(Step.CHANGE_LOAN); sendGTMEvent({ event: GoogleTagManager.LOAN_OFFER_CHANGE })}} variant="outline">Ajustar a proposta</Button>
            </CardFooter>
        </Card>
    )
}