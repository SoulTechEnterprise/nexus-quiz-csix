import { zodResolver } from "@hookform/resolvers/zod"
import { sendGTMEvent } from "@next/third-parties/google"
import { format, isAfter, parse } from "date-fns"
import { ArrowLeft, ArrowRight, BadgeCheck } from "lucide-react"
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
import { create_client_nocodb } from "@/app/actions/nocodb/create-client"
import { update_client_nocodb } from "@/app/actions/nocodb/update-client"
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
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { GoogleTagManager } from "@/enum/google-tag-manager"
import { StatusAuthorizationLink } from "@/enum/status"
import { Step } from "@/enum/step"
import { TypeSimulation } from "@/enum/type_simulation"
import { useLinkZustand } from "@/lib/zustand/link"
import { useSimulationZustand } from "@/lib/zustand/simulation"
import { useStepZustand } from "@/lib/zustand/step"
import { useUserIdentificationZustand } from "@/lib/zustand/user-identification"

const zodSchema = z.object({
	document: z.string().min(11).max(11),
	phone: z.string().min(11).max(11),
})

type ZodSchema = z.infer<typeof zodSchema>

const _FORM = "form-user-identification"

export function UserIdentification() {
	const { track } = useTrack()
	const [openDrawer, setOpenDrawer] = useState(false)

	const { update } = useStepZustand()
	const {
		authorized: getUserIdentificationAuthorized,
		auth: setUserIdentificationAuth,
		data: getUserIdentification,
		update: setUserIdentification,
		clean: cleanUserIdentification,
	} = useUserIdentificationZustand()

	const { data: getLink, update: setLink, clean: cleanLink } = useLinkZustand()

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
			phone: getUserIdentification.phone || "",
		},
	})

	const handleFormUserIdentification = async ({
		document,
		phone,
	}: ZodSchema) => {
		const { success, data } = await get_client_info({ document })

		if (!success) {
			const { error, message } = data

			setError("document", {
				type: "server",
				message: message,
			})

			toast.error(error)

			await track({ event: GoogleTagManager.API_ERROR })

			return
		}

		let { name, sex, date_birth } = data
		date_birth = format(
			parse(date_birth, "dd/MM/yyyy", new Date()),
			"yyyy-MM-dd",
		)

		setUserIdentification({ name, sex, date_birth, document, phone })

		const { link, expiration_date } = await get_auth_link({
			name,
			date_birth,
			document,
		})

		setLink(link, expiration_date)

		const first_name = name.split(" ")[0]
		const last_name = name.split(" ").slice(1).join(" ") || ""

		await track({
			event: GoogleTagManager.CLIENT_DOCUMENT_SUBMITTED,
			data: { name, sex, date_birth, document },
		})

		await create_client_nocodb({ name, sex, date_birth, document, phone })

		sendGTMEvent({
			event: GoogleTagManager.CLIENT_DOCUMENT_SUBMITTED,
			data: {
				client: { first_name, last_name },
			},
		})

		setOpenDrawer(true)
	}

	function handleOptIn() {
		setUserIdentificationAuth(StatusAuthorizationLink.WAITING_FOR_AUTHORIZATION)
	}

	useEffect(() => {
		if (
			getUserIdentificationAuthorized ===
			StatusAuthorizationLink.WAITING_FOR_AUTHORIZATION
		) {
			toast.loading("Aguarde, estamos fazendo a simulação.", {
				id: "toast-loading",
				dismissible: false,
			})
		}

		if (getLink.expiration_date) {
			if (isAfter(new Date(), new Date(getLink.expiration_date))) {
				cleanLink()
			}
		}

		if (
			getUserIdentificationAuthorized === StatusAuthorizationLink.UNAUTHORIZED
		) {
			cleanUserIdentification()
			cleanLink()
		}
	}, [
		getUserIdentificationAuthorized,
		getLink,
		cleanLink,
		cleanUserIdentification,
	])

	useSWR(
		getUserIdentificationAuthorized ===
			StatusAuthorizationLink.WAITING_FOR_AUTHORIZATION
			? [getUserIdentification.document]
			: null,
		() => get_authorized({ document: getUserIdentification.document }),
		{
			revalidateOnFocus: true,
			refreshWhenHidden: false,
			refreshWhenOffline: false,
			refreshInterval: (data) => {
				if (
					!data ||
					!data.status ||
					data.status === StatusAuthorizationLink.WAITING_FOR_AUTHORIZATION
				) {
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
					setUserIdentificationAuth(StatusAuthorizationLink.UNAUTHORIZED)
					update_client_nocodb({
						document: getUserIdentification.document,
						status: StatusAuthorizationLink.UNAUTHORIZED,
					})
					cleanLink()
					cleanUserIdentification()
					setOpenDrawer(false)
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
								duration: 30000,
								dismissible: false,
							},
						)

						setOpenDrawer(false)
						sendGTMEvent({ event: GoogleTagManager.LOAN_OFFER_DENIED })
						track({
							event: GoogleTagManager.LOAN_OFFER_DENIED,
						})
						setUserIdentificationAuth(StatusAuthorizationLink.UNAUTHORIZED)
						update_client_nocodb({
							document: getUserIdentification.document,
							status: StatusAuthorizationLink.UNAUTHORIZED,
						})
						cleanLink()
						cleanUserIdentification()

						return
					}

					toast.dismiss("toast-loading")
					toast.success("Pronto!")

					sendGTMEvent({ event: GoogleTagManager.CLIENT_AUTH_GRANTED })
					track({
						event: GoogleTagManager.CLIENT_AUTH_GRANTED,
					})

					setUserIdentificationAuth(StatusAuthorizationLink.AUTHORIZED)
					setSimulation(response)
					update_client_nocodb({
						document: getUserIdentification.document,
						status: StatusAuthorizationLink.AUTHORIZED,
						step: Step.LOAN_RELEASED,
					})
					update(Step.LOAN_RELEASED)
				}
			},
		},
	)

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BadgeCheck className="size-4 text-blue-500" />{" "}
						{process.env.NEXT_PUBLIC_TITLE_CARD}
					</CardTitle>
					<CardDescription>
						Para iniciar a simulação do seu empréstimo, informe os dados abaixo.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						id={_FORM}
						onSubmit={handleSubmit(handleFormUserIdentification)}
					>
						<FieldGroup>
							<Controller
								name="document"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel>CPF</FieldLabel>
										<InputMask
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
											inputMode="numeric"
										/>
									</Field>
								)}
							/>
						</FieldGroup>
					</form>
				</CardContent>
				<CardFooter>
					<Button disabled={isSubmitting} form={_FORM} type="submit">
						Consultar
					</Button>
				</CardFooter>
			</Card>

			<Drawer open={openDrawer || getLink.link !== null}>
				<DrawerContent className="max-w-sm m-auto">
					<DrawerHeader>
						<DrawerTitle>Autorização de Consulta</DrawerTitle>
						<DrawerDescription>
							Clique no link abaixo para autorizar a consulta do seu empréstimo.
							Assim que finalizar, retorne a esta tela para continuarmos.
						</DrawerDescription>
					</DrawerHeader>
					<DrawerFooter>
						<Button onClick={handleOptIn}>
							<Link
								className="w-full h-full flex items-center justify-center gap-4"
								target="_blank"
								rel="noopener noreferrer"
								href={getLink.link || ""}
							>
								<div className="rotate-90">
									<div className="animate-bounce">
										<ArrowRight className="-rotate-90 size-4" />{" "}
									</div>
								</div>
								ABRIR LINK DE AUTORIZAÇÃO
								<div className="-rotate-90">
									<div className="animate-bounce">
										<ArrowLeft className="rotate-90 size-4" />{" "}
									</div>
								</div>
							</Link>
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</>
	)
}

const InputMask = IMaskMixin(({ inputRef, ...props }: any) => (
	<Input {...props} ref={inputRef} />
))

/*

{getUserIdentificationLink.expiration_date ? (
	<Button onClick={handleOptIn}>
		<Link
			className="w-full h-full flex items-center justify-center gap-4"
			target="_blank"
			rel="noopener noreferrer"
			href={getUserIdentificationLink.url || ""}
		>
			<div className="rotate-90">
				<div className="animate-bounce">
					<ArrowRight className="-rotate-90 size-4" />{" "}
				</div>
			</div>
			ABRIR LINK DE AUTORIZAÇÃO
			<div className="-rotate-90">
				<div className="animate-bounce">
					<ArrowLeft className="rotate-90 size-4" />{" "}
				</div>
			</div>
		</Link>
	</Button>
) : (
	<DrawerTrigger>
		<Button disabled={isSubmitting} form={_FORM} type="submit">
			Consultar
		</Button>
	</DrawerTrigger>
)}
 */
