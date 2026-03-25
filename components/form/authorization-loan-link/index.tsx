import { zodResolver } from "@hookform/resolvers/zod"
import { sendGTMEvent } from "@next/third-parties/google"
import { BadgeCheck } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { IMaskMixin } from "react-imask"
import z from "zod"
import { get_auth_loan } from "@/app/actions/get-auth-loan"
import { send_loan } from "@/app/actions/send-loan"
import { send_message_to_whatsapp } from "@/app/actions/send-message-to-whatsapp"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { GoogleTagManager } from "@/enum/google-tag-manager"
import { Step } from "@/enum/step"
import { useSimulationZustand } from "@/lib/zustand/simulation"
import { useStepZustand } from "@/lib/zustand/step"
import { useUserAddressZustand } from "@/lib/zustand/user-address"
import { useUserBankZustand } from "@/lib/zustand/user-bank"
import { useUserIdentificationZustand } from "@/lib/zustand/user-identification"

const zodSchema = z.object({
	phone: z.string(),
})

type ZodSchema = z.infer<typeof zodSchema>

const _FORM = "form-authorization-loan-link"

export function AuthorizationLoanLink() {
	const { update } = useStepZustand()
	const { data: getUserIdentification, update: setUserIdentification } =
		useUserIdentificationZustand()
	const { data: getUserAddress } = useUserAddressZustand()
	const { data: getUserBank } = useUserBankZustand()

	const { data: getSimulation } = useSimulationZustand()

	const { control, handleSubmit } = useForm<ZodSchema>({
		resolver: zodResolver(zodSchema),
	})

	const handleForm = async ({ phone }: ZodSchema) => {
		setUserIdentification({ ...getUserIdentification, phone })

		send_message_to_whatsapp({
			name: getUserIdentification.name,
			phone,
			link: "https://google.com",
		})

		sendGTMEvent({ event: GoogleTagManager.CLIENT_WHATSAPP_SUBMITTED })

		/*
        
        const proposal_number = await send_loan({
            id_simulation: getSimulation.simulation_id,
            client: {
                info: getUserIdentification,
                address: getUserAddress,
                bank: getUserBank
            }
        })

        await get_auth_loan(proposal_number)
        
        */

		update(Step.THANKS)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BadgeCheck className="size-4 text-blue-500" />{" "}
					{process.env.NEXT_PUBLIC_TITLE_CARD}
				</CardTitle>
				<CardDescription>
					Adicione o seu contato para receber futuras atualizações.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(handleForm)} id={_FORM}>
					<Controller
						name="phone"
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel>Whatsapp</FieldLabel>
								<InputMask
									mask="(00) 00000-0000"
									value={field.value || ""}
									onAccept={(value: string) => {
										field.onChange(value)
									}}
									lazy={true}
									unmask={true}
									placeholder="(00) 00000-0000"
								/>
							</Field>
						)}
					/>
				</form>
			</CardContent>
			<CardFooter>
				<Button type="submit" form={_FORM}>
					Próximo
				</Button>
			</CardFooter>
		</Card>
	)
}

const InputMask = IMaskMixin(({ inputRef, ...props }: any) => (
	<Input {...props} ref={inputRef} />
))
