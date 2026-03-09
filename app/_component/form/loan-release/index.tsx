import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Step } from "@/enum/step";
import { useStepZustand } from "@/lib/zustand/step";
import { BadgeCheck } from "lucide-react";

export function LoanReleased() {
    const { update } = useStepZustand()

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BadgeCheck className="size-4 text-blue-500" /> {process.env.NEXT_PUBLIC_TITLE_CARD}</CardTitle>
                <CardDescription>Simulação concluída! Veja os detalhes e condições do seu empréstimo.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2 [&_p]:text-muted-foreground">
                    <div className="flex justify-between">
                        <p>Dinheiro na Conta:</p>
                        <span>R$ 1.000,00</span>
                    </div>

                    <div className="flex justify-between">
                        <p>Plano:</p>
                        <span>48x de R$ 93,48</span>
                    </div>

                    <div className="flex justify-between">
                        <p>Taxa de Juros:</p>
                        <span>1,88% ao mês</span>
                    </div>

                    <div className="flex justify-between">
                        <p>Valor Total do Empréstimo:</p>
                        <span>R$ 4.487,04</span>
                    </div>

                    <div className="flex justify-between">
                        <p>Primeira Parcela:</p>
                        <span>01/02/2026</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="grid gap-2">
                <Button onClick={() => update(Step.USER_ADDRESS)}>Próximo</Button>
                <Button onClick={() => update(Step.CHANGE_LOAN)} variant="outline">Mudar o valor</Button>
            </CardFooter>
        </Card>
    )
}