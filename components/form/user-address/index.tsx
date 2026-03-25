import { zodResolver } from "@hookform/resolvers/zod"
import { sendGTMEvent } from "@next/third-parties/google"
import axios from "axios"
import { BadgeCheck } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { IMaskMixin } from "react-imask"
import { toast } from "sonner"
import z from "zod"
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
import { GoogleTagManager } from "@/enum/google-tag-manager"
import { Step } from "@/enum/step"
import { useStepZustand } from "@/lib/zustand/step"
import { useUserAddressZustand } from "@/lib/zustand/user-address"

const zodScheme = z.object({
	zip_code: z.string().min(8).max(8),
	street: z.string().nonempty(),
	number: z.string().min(1),
	district: z.string().nonempty(),
	city: z.string().nonempty(),
	state: z.string().nonempty(),
	complement: z.string().nonempty(),
})

type ZodSchema = z.infer<typeof zodScheme>

const _FORM = "form-user-address"

export function UserAddress() {
	const { update } = useStepZustand()
	const {
		data: { zip_code, street, number, district, city, state, complement },
		update: setUserAddress,
	} = useUserAddressZustand()

	const {
		control,
		handleSubmit,
		setValue,
		setError,
		clearErrors,
		setFocus,
		formState: { isSubmitting },
	} = useForm({
		resolver: zodResolver(zodScheme),
		values: {
			zip_code: zip_code || "",
			street: street || "",
			number: number || "",
			district: district || "",
			city: city || "",
			state: state || "",
			complement: complement || "",
		},
	})

	const handleZipCode = async (zip_code: string) => {
		if (zip_code.length > 7) {
			const { data } = await axios.get(
				`https://viacep.com.br/ws/${zip_code}/json/`,
			)

			if (data.erro) {
				toast.error("O CEP não existe, digite novamente")

				setValue("zip_code", "", { shouldValidate: true })
				setError("zip_code", {})
				return
			}

			const {
				logradouro: street,
				bairro: district,
				localidade: city,
				uf: state,
			} = data

			clearErrors("zip_code")

			setValue("street", street, { shouldValidate: true })
			setValue("district", district, { shouldValidate: true })
			setValue("city", city, { shouldValidate: true })
			setValue("state", state, { shouldValidate: true })

			setFocus("number")
		}
	}

	const handleForm = async ({
		zip_code,
		street,
		number,
		district,
		city,
		state,
	}: ZodSchema) => {
		setUserAddress({
			zip_code,
			street,
			number,
			district,
			city,
			state,
			complement,
		})

		sendGTMEvent({
			event: GoogleTagManager.CLIENT_ADDRESS_SUBMITTED,
			data: {
				client: {
					zip_code,
					city,
					state,
				},
			},
		})

		toast.success("Ok! Conseguimos anexar seu endereço no empréstimo.")

		update(Step.USER_BANK)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BadgeCheck className="size-4 text-blue-500" />{" "}
					{process.env.NEXT_PUBLIC_TITLE_CARD}
				</CardTitle>
				<CardDescription>
					Digite seu CEP para preenchermos o endereço automaticamente.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form id={_FORM} onSubmit={handleSubmit(handleForm)}>
					<FieldGroup>
						<Controller
							name="zip_code"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>CEP</FieldLabel>
									<InputMask
										mask="00000-000"
										value={field.value || ""}
										onAccept={(value: string) => {
											field.onChange(value)
											handleZipCode(value)
										}}
										lazy={true}
										unmask={true}
										placeholder="00000-000"
									/>
								</Field>
							)}
						/>

						<div className="grid grid-cols-3 gap-4">
							<Controller
								name="street"
								control={control}
								render={({ field, fieldState }) => (
									<Field
										className="col-span-2"
										data-invalid={fieldState.invalid}
									>
										<FieldLabel>Rua</FieldLabel>
										<Input {...field} placeholder="Ex: Rua das Flores" />
									</Field>
								)}
							/>

							<Controller
								name="number"
								control={control}
								render={({ field, fieldState }) => (
									<Field
										className="col-span-1"
										data-invalid={fieldState.invalid}
									>
										<FieldLabel>Número</FieldLabel>
										<Input {...field} placeholder="123" />
									</Field>
								)}
							/>
						</div>

						<Controller
							name="district"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Bairro</FieldLabel>
									<Input {...field} placeholder="Centro" />
								</Field>
							)}
						/>

						<div className="grid grid-cols-3 gap-4">
							<Controller
								name="city"
								control={control}
								render={({ field, fieldState }) => (
									<Field
										className="col-span-2"
										data-invalid={fieldState.invalid}
									>
										<FieldLabel>Cidade</FieldLabel>
										<Input {...field} placeholder="São Paulo" />
									</Field>
								)}
							/>

							<Controller
								name="state"
								control={control}
								render={({ field, fieldState }) => (
									<Field
										className="col-span-1"
										data-invalid={fieldState.invalid}
									>
										<FieldLabel>Estado</FieldLabel>
										<Input {...field} placeholder="SP" />
									</Field>
								)}
							/>
						</div>

						<Controller
							name="complement"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Complemento</FieldLabel>
									<Input {...field} placeholder="Apartamento A" />
								</Field>
							)}
						/>
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter>
				<Button disabled={isSubmitting} form={_FORM} type="submit">
					Próximo
				</Button>
			</CardFooter>
		</Card>
	)
}

const InputMask = IMaskMixin(({ inputRef, ...props }: any) => (
	<Input {...props} ref={inputRef} />
))
