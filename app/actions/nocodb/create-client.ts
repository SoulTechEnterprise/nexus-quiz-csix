"use server"

import axios from "axios"

export interface create_client_nocodb_req {
	document: string
	name: string
	phone: string
	date_birth: string
	sex: string
}

export interface create_client_nocodb_res {
	id: string
}

export async function create_client_nocodb({
	document,
	name,
	phone,
	date_birth,
	sex,
}: create_client_nocodb_req): Promise<create_client_nocodb_res | null> {
	try {
		const { data } = await axios.post(
			"https://nexus-nocodb.soultech.agency/api/v3/data/pgbrm4y30vmbv9i/mod3f86pvzylk9h/records",
			{
				fields: {
					document,
					name,
					phone,
					date_birth,
					sex,
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
