import { zodResolver } from "@hookform/resolvers/zod"
import { sendGTMEvent } from "@next/third-parties/google"
import { BadgeCheck } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { IMaskMixin } from "react-imask"
import z from "zod"
import { get_simulation } from "@/app/actions/get-simulation"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { GoogleTagManager } from "@/enum/google-tag-manager"
import { Step } from "@/enum/step"
import { TypeSimulation } from "@/enum/type_simulation"
import { useSimulationZustand } from "@/lib/zustand/simulation"
import { useStepZustand } from "@/lib/zustand/step"
import { useUserIdentificationZustand } from "@/lib/zustand/user-identification"

const createZodSchema = (maxAmount: number) =>
	z.object({
		instalment: z.enum(["12x", "24x", "36x", "48x"]),
		amount: z.string().refine((val) => {
			const parsed = Number(val.replace(/\./g, "").replace(",", "."))
			if (maxAmount === null) return true
			return parsed <= maxAmount
		}, "O valor não pode ser maior que o limite disponível"),
	})

type ZodSchema = z.infer<ReturnType<typeof createZodSchema>>

const _FORM = "form-change-loan"

export function ChangeLoan() {
	const { update } = useStepZustand()
	const { data: getSimulation, update: setSimulation } = useSimulationZustand()
	const { data: getUserIdentification } = useUserIdentificationZustand()

	const { control, handleSubmit } = useForm<ZodSchema>({
		resolver: zodResolver(createZodSchema(getSimulation?.client_amount || 0)),
	})

	const handleForm = async ({ instalment, amount }: ZodSchema) => {
		const _amount = Number(amount.replace(/\./g, "").replace(",", "."))
		const _instalment = Number(instalment.replace("x", ""))

		const response = await get_simulation({
			document: getUserIdentification.document,
			type_simulation: TypeSimulation.AMOUNT,
			amount: _amount,
			instalment: _instalment,
		})

		if (!response) {
			return
		}

		sendGTMEvent({ event: GoogleTagManager.LOAN_OFFER_CHANGED })

		setSimulation(response)
		update(Step.LOAN_RELEASED)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BadgeCheck className="size-4 text-blue-500" />{" "}
					{process.env.NEXT_PUBLIC_TITLE_CARD}
				</CardTitle>
				<CardDescription>
					Ajuste os detalhes da sua proposta e avance para a próxima etapa da
					simulação. (Valor máximo:{" "}
					{new Intl.NumberFormat("pt-BR", {
						style: "currency",
						currency: "BRL",
					}).format(Number(getSimulation?.client_amount))}
					)
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(handleForm)} id={_FORM}>
					<FieldGroup>
						<Controller
							name="amount"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Novo valor</FieldLabel>
									<InputMask
										mask={Number}
										radix=","
										thousandsSeparator="."
										padFractionalZeros={true}
										normalizeZeros={true}
										scale={2}
										min={0}
										max={1000000}
										value={field.value?.toString() || ""}
										unmask={false}
										onAccept={(value: string) => field.onChange(value)}
										placeholder="R$ 0,00"
										inputMode="numeric"
									/>
								</Field>
							)}
						/>

						<Controller
							name="instalment"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Quantidade de parcelas</FieldLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value ?? ""}
									>
										<SelectTrigger>
											<SelectValue placeholder="..." />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value="12x">12x</SelectItem>
												<SelectItem value="24x">24x</SelectItem>
												<SelectItem value="26x">26x</SelectItem>
												<SelectItem value="48x">48x</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
								</Field>
							)}
						/>
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter>
				<Button type="submit" form={_FORM}>
					Verificar
				</Button>
			</CardFooter>
		</Card>
	)
}

const InputMask = IMaskMixin(({ inputRef, ...props }: any) => (
	<Input {...props} ref={inputRef} />
))
