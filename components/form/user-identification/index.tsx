import { zodResolver } from "@hookform/resolvers/zod"
import { sendGTMEvent } from "@next/third-parties/google"
import { format, parse } from "date-fns"
import { BadgeCheck } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { IMaskMixin } from "react-imask"
import { toast } from "sonner"
import useSWR from "swr"
import z from "zod"
import { get_auth_link } from "@/app/actions/get-auth-link"
import { get_authorized } from "@/app/actions/get-authorized"
import { get_client_info } from "@/app/actions/get-client-info"
import { get_simulation } from "@/app/actions/get-simulation"
import { useTrack } from "@/app/hooks/use-track"
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
import { StatusAuthorizationLink } from "@/enum/status"
import { Step } from "@/enum/step"
import { TypeSimulation } from "@/enum/type_simulation"
import { useSimulationZustand } from "@/lib/zustand/simulation"
import { useStepZustand } from "@/lib/zustand/step"
import { useUserIdentificationZustand } from "@/lib/zustand/user-identification"

const zodSchema = z.object({
	document: z.string().min(11).max(11),
})

type ZodSchema = z.infer<typeof zodSchema>

const _FORM = "form-user-identification"

export function UserIdentification() {
	const { track } = useTrack()

	const { update } = useStepZustand()
	const {
		authorized: getUserIdentificationAuthorized,
		auth: setUserIdentificationAuth,
		data: getUserIdentification,
		link: getUserIdentificationLink,
		update_link: setUserIdentificationLink,
		update: setUserIdentification,
	} = useUserIdentificationZustand()

	const { update: setSimulation } = useSimulationZustand()

	const {
		control,
		handleSubmit,
		setError,
		formState: { isSubmitting },
	} = useForm<ZodSchema>({
		resolver: zodResolver(zodSchema),
		values: {
			document: getUserIdentification.document || "",
		},
	})

	const handleFormUserIdentification = async ({ document }: ZodSchema) => {
		const { success, data } = await get_client_info({ document })

		if (!success) {
			const { error, message } = data

			setError("document", {
				type: "server",
				message: message,
			})

			toast.error(error)

			track({ event: GoogleTagManager.API_ERROR })
		} else {
			let { name, sex, date_birth } = data
			date_birth = format(
				parse(date_birth, "dd/MM/yyyy", new Date()),
				"yyyy-MM-dd",
			)

			setUserIdentification({ name, sex, date_birth, document })

			const { link } = await get_auth_link({ name, date_birth, document })

			setUserIdentificationLink(link)

			const first_name = name.split(" ")[0]
			const last_name = name.split(" ").slice(1).join(" ") || ""

			track({
				event: GoogleTagManager.CLIENT_DOCUMENT_SUBMITTED,
				data: { name, sex, date_birth, document },
			})
			sendGTMEvent({
				event: GoogleTagManager.CLIENT_DOCUMENT_SUBMITTED,
				data: {
					client: { first_name, last_name },
				},
			})

			setUserIdentificationAuth(
				GoogleTagManager.CLIENT_WAITING_FOR_AUTHORIZATION,
			)

			window.open(link, "_blank", "noopener,noreferrer")
		}
	}

	useEffect(() => {
		if (
			getUserIdentificationAuthorized ===
			GoogleTagManager.CLIENT_WAITING_FOR_AUTHORIZATION
		) {
			toast.loading("Aguarde, estamos fazendo a simulação.", {
				id: "toast-loading",
			})
		}
	}, [getUserIdentificationAuthorized])

	useSWR(
		getUserIdentificationAuthorized ===
			GoogleTagManager.CLIENT_WAITING_FOR_AUTHORIZATION
			? [getUserIdentification.document]
			: null,
		() => get_authorized({ document: getUserIdentification.document }),
		{
			refreshInterval: (data) => {
				if (!data) return 0

				if (!data?.status) {
					sendGTMEvent({
						event: GoogleTagManager.CLIENT_WAITING_FOR_AUTHORIZATION,
					})
					track({
						event: GoogleTagManager.CLIENT_WAITING_FOR_AUTHORIZATION,
					})

					return 5000
				}

				if (data.status === StatusAuthorizationLink.WAITING_FOR_AUTHORIZATION) {
					sendGTMEvent({
						event: GoogleTagManager.CLIENT_WAITING_FOR_AUTHORIZATION,
					})
					track({
						event: GoogleTagManager.CLIENT_WAITING_FOR_AUTHORIZATION,
					})

					return 5000
				}

				return 0
			},
			onSuccess: async (data) => {
				if (data.status === StatusAuthorizationLink.UNAUTHORIZED) {
					toast.dismiss("toast-loading")
					toast.error("Não foi autorizado a simulação do empréstimo")

					sendGTMEvent({ event: GoogleTagManager.CLIENT_AUTH_DENIED })
					track({
						event: GoogleTagManager.CLIENT_AUTH_DENIED,
					})
					setUserIdentificationAuth(GoogleTagManager.CLIENT_AUTH_DENIED)
				}

				if (data.status === StatusAuthorizationLink.AUTHORIZED) {
					const response = await get_simulation({
						document: getUserIdentification.document,
						type_simulation: TypeSimulation.MAX,
					})

					if (response === null) {
						toast.dismiss("toast-loading")
						toast.error(
							"O banco não liberou nenhuma quantia de empréstimo para você.",
							{
								duration: 10000,
							},
						)

						sendGTMEvent({ event: GoogleTagManager.LOAN_OFFER_DENIED })
						track({
							event: GoogleTagManager.LOAN_OFFER_DENIED,
						})
						setUserIdentificationAuth(GoogleTagManager.CLIENT_AUTH_DENIED)

						return
					}

					toast.dismiss("toast-loading")
					toast.success("Pronto!")

					sendGTMEvent({ event: GoogleTagManager.CLIENT_AUTH_GRANTED })
					track({
						event: GoogleTagManager.CLIENT_AUTH_GRANTED,
					})

					setUserIdentificationAuth(GoogleTagManager.CLIENT_AUTH_GRANTED)
					setSimulation(response)
					update(Step.LOAN_RELEASED)
				}
			},
		},
	)

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BadgeCheck className="size-4 text-blue-500" />{" "}
					{process.env.NEXT_PUBLIC_TITLE_CARD}
				</CardTitle>
				<CardDescription>
					Para iniciar a simulação do seu empréstimo, informe o seu CPF abaixo.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form id={_FORM} onSubmit={handleSubmit(handleFormUserIdentification)}>
					<FieldGroup>
						<Controller
							name="document"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>CPF</FieldLabel>
									<InputDocument
										mask="000.000.000-00"
										value={field.value || ""}
										onAccept={(value: string) => field.onChange(value)}
										lazy={true}
										unmask={true}
										placeholder="000.000.000-00"
										inputMode="numeric"
									/>
								</Field>
							)}
						/>
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter>
				{getUserIdentificationLink ? (
					<Button>
						<Link
							target="_blank"
							rel="noopener noreferrer"
							href={getUserIdentificationLink}
						>
							Abrir link
						</Link>
					</Button>
				) : (
					<Button disabled={isSubmitting} form={_FORM} type="submit">
						Consultar
					</Button>
				)}
			</CardFooter>
		</Card>
	)
}

const InputDocument = IMaskMixin(({ inputRef, ...props }: any) => (
	<Input {...props} ref={inputRef} />
))
