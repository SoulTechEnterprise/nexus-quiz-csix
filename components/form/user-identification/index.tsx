import { IMaskMixin } from "react-imask"

import { Button } from "@/components/ui/button"
import {
    Card, CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import {
    Field, FieldGroup,
    FieldLabel
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { get_client_info } from "@/app/actions/get-client-info"
import { toast } from "sonner"
import { useUserIdentificationZustand } from "@/lib/zustand/user-identification"
import { useStepZustand } from "@/lib/zustand/step"
import { get_auth_link } from "@/app/actions/get-auth-link"
import { Step } from "@/enum/step"
import { BadgeCheck } from "lucide-react"
import { sendGTMEvent } from "@next/third-parties/google"
import useSWR from "swr"
import { get_authorized } from "@/app/actions/get-authorized"
import { StatusAuthorizationLink } from "@/enum/status"
import { get_simulation } from "@/app/actions/get-simulation"
import { TypeSimulation } from "@/enum/type_simulation"
import { GoogleTagManager } from "@/enum/google-tag-manager"
import { useState } from "react"


const zodSchema = z.object({
    document: z.string().min(11).max(11)
})

type ZodSchema = z.infer<typeof zodSchema>

const _FORM = "form-user-identification"

export function UserIdentification() {

    const { update } = useStepZustand()
    const { data: getUserIdentification, update: setUserIdentification } = useUserIdentificationZustand()
    
    const [ polling, setPolling ] = useState(false)

    const { control, handleSubmit, setError, formState: { isSubmitting } } = useForm<ZodSchema>({
        resolver: zodResolver(zodSchema),
        defaultValues: {
            document: getUserIdentification.document || ""
        }
    })

    const handleFormUserIdentification = async ({ document }: ZodSchema) => {
        const { success, data } = await get_client_info({ document })

        if(!success) {
            const { code, error, message } = data

            setError("document", {
                type: "server",
                message: message
            })

            toast.error(error)
        } else {
            const { name, sex, date_birth } = data
            setUserIdentification({ name, sex, date_birth, document })

            toast.success(`Olá ${name}!`)

            const { link } = await get_auth_link({ name, date_birth, document })

            const first_name = name.split(' ')[0]
            const last_name = name.split(' ').slice(1).join(' ') || ""

            sendGTMEvent({ event: GoogleTagManager.CLIENT_DOCUMENT_SUBMITTED, data: {
                client: { first_name, last_name }
            } })

            window.open(link, '_blank', 'noopener,noreferrer');

            setPolling(true)
        }
    }

    useSWR(
        polling ? [, getUserIdentification.document] : null,
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

                    sendGTMEvent({ event: GoogleTagManager.CLIENT_AUTH_DENIED })
                }

                if (data.status === StatusAuthorizationLink.AUTORIZADO) {
                    toast.success("Pronto!")

                    const response = await get_simulation({ document: getUserIdentification.document, type_simulation: TypeSimulation.MAX })

                    sendGTMEvent({ event: GoogleTagManager.CLIENT_AUTH_GRANTED })

                    update(Step.LOAN_RELEASED)
                }
            }
        }
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BadgeCheck className="size-4 text-blue-500" /> {process.env.NEXT_PUBLIC_TITLE_CARD}</CardTitle>
                <CardDescription>Para iniciar a simulação do seu empréstimo, informe o seu CPF abaixo.</CardDescription>
            </CardHeader>
            <CardContent>
                <form id={_FORM} onSubmit={handleSubmit(handleFormUserIdentification)}>
                    <FieldGroup>
                        <Controller
                            name="document"
                            control={control}
                            render={({field, fieldState}) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>CPF</FieldLabel>
                                    <InputDocument
                                        mask="000.000.000-00"
                                        value={field.value || ""}
                                        onAccept={(value: string) => field.onChange(value)}
                                        lazy={true}
                                        unmask={true}
                                        placeholder="000.000.000-00"
                                    />
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Button disabled={isSubmitting} form={_FORM} type="submit">Consultar</Button>
            </CardFooter>
        </Card>
    )
}

const InputDocument = IMaskMixin(({ inputRef, ...props }: any) => (
  <Input {...props} ref={inputRef} />
))