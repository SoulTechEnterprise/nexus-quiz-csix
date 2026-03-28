"use server"

import axios from "axios"
import { get_client_nocodb } from "./get-client"

export interface update_client_nocodb_req {
	document: string
	phone?: string
	step?: string
	status?: string
}

export interface update_client_nocodb_res {
	id: string
}

export async function update_client_nocodb({
	document,
	...fields
}: update_client_nocodb_req): Promise<update_client_nocodb_res | null> {
	try {
		const client = await get_client_nocodb({ document })

		if (!client) {
			return null
		}

		const { name, phone, date_birth, step, contact, sex, status, workflow } =
			client.fields

		const { data } = await axios.post(
			"https://nexus-nocodb.soultech.agency/api/v3/data/pgbrm4y30vmbv9i/mod3f86pvzylk9h/records",
			{
				id: client.id,
				fields: {
					document,
					name,
					phone,
					date_birth,
					step,
					contact,
					sex,
					status,
					workflow,
					...fields,
				},
			},
			{
				headers: {
					Authorization: `Bearer ${process.env.NOCODB_API_KEY}`,
				},
			},
		)

		if (!data) {
			return null
		}

		return data
	} catch {
		return null
	}
}
