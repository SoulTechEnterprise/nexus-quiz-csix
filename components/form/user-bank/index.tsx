import { zodResolver } from "@hookform/resolvers/zod"
import { sendGTMEvent } from "@next/third-parties/google"
import { BadgeCheck } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
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

import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox"
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Bank } from "@/enum/bank"
import { GoogleTagManager } from "@/enum/google-tag-manager"
import { Step } from "@/enum/step"
import { useStepZustand } from "@/lib/zustand/step"
import { useUserBankZustand } from "@/lib/zustand/user-bank"

const zodSchema = z.object({
	type: z.enum(Bank),
	code: z.string().nonempty(),
	agency: z.string().nonempty(),
	agency_digit: z.string().default("0"),
	account: z.string().nonempty(),
	account_digit: z.string().default("0"),
})

type ZodSchema = z.infer<typeof zodSchema>

const _FORM = "form-user-bank"

export function UserBank() {
	const { update } = useStepZustand()
	const {
		data: { type, code, agency, agency_digit, account, account_digit },
		update: setUserBank,
	} = useUserBankZustand()

	const { control, handleSubmit } = useForm({
		resolver: zodResolver(zodSchema),
		values: {
			type: (type || "") as any,
			code: code || "",
			agency: agency || "",
			agency_digit: agency_digit || "",
			account: account || "",
			account_digit: account_digit || "",
		},
	})

	const banks = [
		"001 - Banco do Brasil S.A.",
		"033 - Banco Santander (Brasil) S.A.",
		"077 - Banco Inter S.A.",
		"104 - Caixa Econômica Federal",
		"197 - Stone Pagamentos S.A.",
		"208 - Banco BTG Pactual S.A.",
		"212 - Banco Original S.A.",
		"237 - Banco Bradesco S.A.",
		"260 - Nubank (Nu Pagamentos S.A.)",
		"290 - PagSeguro Internet S.A.",
		"336 - Banco C6 S.A.",
		"341 - Itaú Unibanco S.A.",
		"464 - Banco Sumitomo Mitsui Brasileiro S.A.",
		"633 - Banco Rendimento S.A.",
		"652 - Itaú Unibanco Holding S.A.",
		"745 - Citibank N.A.",
		"748 - Banco Cooperativo Sicredi S.A.",
		"756 - Banco Cooperativo do Brasil S.A. (Sicoob)",
	]

	const handleFormUserBank = ({
		type,
		code,
		agency,
		agency_digit,
		account,
		account_digit,
	}: ZodSchema) => {
		toast.success("Banco adicionado com sucesso!")

		setUserBank({ type, code, agency, agency_digit, account, account_digit })

		sendGTMEvent({ event: GoogleTagManager.CLIENT_BANK_SUBMITTED })

		update(Step.AUTHORIZATION_LOAN_LINK)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BadgeCheck className="size-4 text-blue-500" />{" "}
					{process.env.NEXT_PUBLIC_TITLE_CARD}
				</CardTitle>
				<CardDescription>
					Informe a conta bancária para o depósito do empréstimo.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(handleFormUserBank)} id={_FORM}>
					<FieldGroup>
						<Controller
							name="type"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Tipo de Conta</FieldLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value ?? ""}
									>
										<SelectTrigger>
											<SelectValue placeholder="..." />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value="Corrente Individual">
													Corrente Individual
												</SelectItem>
												<SelectItem value="Poupança Individual">
													Poupança Individual
												</SelectItem>
												<SelectItem value="Investimento">
													Investimento
												</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
								</Field>
							)}
						/>

						<Controller
							name="code"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Banco</FieldLabel>

									<Combobox
										{...field}
										items={banks}
										value={field.value ?? ""}
										onValueChange={field.onChange}
									>
										<ComboboxInput placeholder="..." />
										<ComboboxContent>
											<ComboboxEmpty>No items found.</ComboboxEmpty>
											<ComboboxList>
												{(item) => (
													<ComboboxItem key={item} value={item}>
														{item}
													</ComboboxItem>
												)}
											</ComboboxList>
										</ComboboxContent>
									</Combobox>
								</Field>
							)}
						/>

						<div className="grid grid-cols-3 gap-4">
							<Controller
								name="agency"
								control={control}
								render={({ field, fieldState }) => (
									<Field
										className="col-span-2"
										data-invalid={fieldState.invalid}
									>
										<FieldLabel>Agência</FieldLabel>
										<Input
											{...field}
											placeholder="1234"
											value={field.value ?? ""}
											inputMode="numeric"
										/>
									</Field>
								)}
							/>

							<Controller
								name="agency_digit"
								control={control}
								render={({ field, fieldState }) => (
									<Field
										className="col-span-1"
										data-invalid={fieldState.invalid}
									>
										<FieldLabel>Dígito</FieldLabel>
										<Input
											{...field}
											placeholder="0"
											value={field.value ?? ""}
										/>
									</Field>
								)}
							/>

							<FieldDescription className="col-span-3">
								Caso não tenha dígito, deixe em branco
							</FieldDescription>
						</div>

						<div className="grid grid-cols-3 gap-4">
							<Controller
								name="account"
								control={control}
								render={({ field, fieldState }) => (
									<Field
										className="col-span-2"
										data-invalid={fieldState.invalid}
									>
										<FieldLabel>Conta</FieldLabel>
										<Input
											{...field}
											placeholder="123456789"
											value={field.value ?? ""}
											inputMode="numeric"
										/>
									</Field>
								)}
							/>

							<Controller
								name="account_digit"
								control={control}
								render={({ field, fieldState }) => (
									<Field
										className="col-span-1"
										data-invalid={fieldState.invalid}
									>
										<FieldLabel>Dígito</FieldLabel>
										<Input
											{...field}
											placeholder="0"
											value={field.value ?? ""}
										/>
									</Field>
								)}
							/>

							<FieldDescription className="col-span-3">
								Caso não tenha dígito, deixe em branco
							</FieldDescription>
						</div>
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter>
				<Button form={_FORM} type="submit">
					Próximo
				</Button>
			</CardFooter>
		</Card>
	)
}
