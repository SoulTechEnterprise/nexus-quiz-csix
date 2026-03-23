import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleTagManager } from "@/enum/google-tag-manager";
import { sendGTMEvent } from "@next/third-parties/google";
import { BadgeCheck } from "lucide-react";
import Link from "next/link";

export function Thanks() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BadgeCheck className="size-4 text-blue-500" /> {process.env.NEXT_PUBLIC_TITLE_CARD}</CardTitle>
                <CardDescription>Falta só mais um passo!</CardDescription>
            </CardHeader>
            <CardContent>
                Vamos enviar um link de autorização no seu WhatsApp. Ele é a sua chave de segurança para liberar o dinheiro e concluir a transferência para a sua conta.
            </CardContent>
            <CardFooter>
                <Button onClick={() => sendGTMEvent({ event: GoogleTagManager.WHATSAPP_CLICKED })}>
                    <Link className="w-full h-full flex items-center justify-center" href={process.env.NEXT_PUBLIC_LINK_WHATSAPP || ""}>Abrir WhatsApp</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}