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
import { useLinkAuthorizationZustand } from "@/lib/zustand/link-authorization"
import { Step } from "@/enum/step"
import { BadgeCheck } from "lucide-react"

const zodSchema = z.object({
    document: z.string().min(11).max(11)
})

type ZodSchema = z.infer<typeof zodSchema>

const _FORM = "form-user-identification"

export function UserIdentification() {

    const { update } = useStepZustand()
    const { data: getUserIdentification, update: setUserIdentification } = useUserIdentificationZustand()
    const { update: setLinkAuthorization } = useLinkAuthorizationZustand()

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

            setLinkAuthorization(link)

            update(Step.AUTHORIZATION_LINK)
        }
    }

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
                <Button disabled={isSubmitting} form={_FORM} type="submit">Próximo</Button>
            </CardFooter>
        </Card>
    )
}

const InputDocument = IMaskMixin(({ inputRef, ...props }: any) => (
  <Input {...props} ref={inputRef} />
))