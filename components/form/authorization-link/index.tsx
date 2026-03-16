import useSWR from "swr"

import { Button } from "@/components/ui/button"
import {
    Card, CardContent,
    CardDescription, CardHeader,
    CardTitle
} from "@/components/ui/card"
import { useLinkAuthorizationZustand } from "@/lib/zustand/link-authorization"
import Link from "next/link"
import { get_authorized } from "@/app/actions/get-authorized"
import { useUserIdentificationZustand } from "@/lib/zustand/user-identification"
import { StatusAuthorizationLink } from "@/enum/status"
import { toast } from "sonner"
import { useStepZustand } from "@/lib/zustand/step"
import { Step } from "@/enum/step"
import { BadgeCheck } from "lucide-react"
import { get_simulation } from "@/app/actions/get-simulation"
import { TypeSimulation } from "@/enum/type_simulation"

export function AuthorizationLink() {
    const { data: getLinkAuthorization } = useLinkAuthorizationZustand()
    const { data: getUserIdentification } = useUserIdentificationZustand()
    const { update } = useStepZustand()

    useSWR(
        getUserIdentification?.document ? [, getUserIdentification.document] : null,
        () => get_authorized({ document: getUserIdentification.document }),
        { 
            refreshInterval: (data) => {
                if (!data?.status) return 1000
                
                if (data.status === StatusAuthorizationLink.AGUARDANDO_AUTORIZACAO) return 1000
                
                return 0
            },
            onSuccess: async (data) => {
                if (data.status === StatusAuthorizationLink.NAO_AUTORIZADO) {
                    toast.error("Infelizmente você não autorizou a simulação do empréstimo")
                }

                if (data.status === StatusAuthorizationLink.AUTORIZADO) {
                    toast.success("Pronto!")

                    const response = await get_simulation({ document: getUserIdentification.document, type_simulation: TypeSimulation.MAX })

                    update(Step.LOAN_RELEASED)
                }
            }
        }
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BadgeCheck className="size-4 text-blue-500" /> {process.env.NEXT_PUBLIC_TITLE_CARD}</CardTitle>
                <CardDescription>Falta pouco! Clique no botão abaixo para autorizar a simulação. Estamos aguardando a sua confirmação para prosseguir.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="outline">
                    <Link href={getLinkAuthorization.link || ""}>Link</Link>
                </Button>
            </CardContent>
        </Card>
    )
}