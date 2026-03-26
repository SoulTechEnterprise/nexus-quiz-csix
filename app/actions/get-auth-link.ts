"use server"

import axios from "axios"
import { get_access_token } from "./get-access-token"

interface get_auth_link_req {
	name: string
	document: string
	date_birth: string
}

interface get_auth_link_res {
	link: string
}

export async function get_auth_link({
	name,
	document,
	date_birth,
}: get_auth_link_req): Promise<get_auth_link_res> {
	const { access_token } = await get_access_token()

	const { data } = await axios.post(
		"https://marketplace-proposal-service-api-p.c6bank.info/marketplace/authorization/generate-liveness",
		{
			nome: name,
			cpf: document,
			data_nascimento: date_birth,
		},
		{
			headers: {
				Authorization: access_token,
			},
		},
	)

	const { link } = data

	return { link }
}
