"use server"

import axios from "axios"

export interface get_client_nocodb_req {
	document: string
}

export interface get_client_nocodb_res {
	id: string
	fields: {
		document: string
		name: string
		phone: string
		date_birth: string
		step: string
		contact: string
		sex: string
		status: string
		workflow: Array<string>
	}
}

export async function get_client_nocodb({
	document,
}: get_client_nocodb_req): Promise<get_client_nocodb_res | null> {
	const { data } = await axios.get(
		"https://nexus-nocodb.soultech.agency/api/v3/data/pgbrm4y30vmbv9i/mod3f86pvzylk9h/records",
		{
			headers: {
				Authorization: `Bearer ${process.env.NOCODB_API_KEY}`,
			},
			params: {
				fields: "id",
				where: document,
			},
		},
	)

	if (!data) {
		return null
	}

	return data
}
