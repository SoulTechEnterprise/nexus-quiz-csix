"use server"

import axios from "axios"
import type { StatusAuthorizationLink } from "@/enum/status"
import { get_access_token } from "./get-access-token"

interface get_authorized_req {
	document: string
}

interface get_authorized_res {
	status: StatusAuthorizationLink
}

export async function get_authorized({
	document,
}: get_authorized_req): Promise<get_authorized_res> {
	const { access_token } = await get_access_token()

	const { data } = await axios.post(
		"https://marketplace-proposal-service-api-p.c6bank.info/marketplace/authorization/status",
		{
			cpf: document,
		},
		{
			headers: {
				Authorization: access_token,
			},
		},
	)

	const { status } = data

	console.log(status)

	return { status }
}
