"use server"

import axios from "axios"
import { get_access_token } from "./get-access-token"

interface send_loan_req {
	id_simulation: string
	client: {
		info: {
			document: string
			phone: string
		}
		address: {
			zip_code: string
			street: string
			number: string
			district: string
			city: string
			state: string
			complement: string
		}
		bank: {
			type: string
			code: string
			agency: string
			agency_digit: string
			account: string
			account_digit: string
		}
	}
}

interface send_loan_res {
	proposal_number: string
}

export async function send_loan({
	id_simulation,
	client,
}: send_loan_req): Promise<send_loan_res> {
	const { access_token } = await get_access_token()

	const { data } = await axios.post(
		"https://marketplace-proposal-service-api-p.c6bank.info/marketplace/worker-payroll-loan-offers/include",
		{
			id_simulacao: id_simulation,
			cpf: client.info.document,
			ddd: client.info.phone.slice(0, 2),
			numero_telefone: client.info.phone.slice(2, client.info.phone.length),
			logradouro: client.address.street,
			numero: client.address.number,
			cep: client.address.zip_code,
			bairro: client.address.district,
			cidade: client.address.city,
			uf: client.address.state,
			dados_bancarios: {
				tipo_conta: client.bank.type,
				numero_banco: client.bank.code,
				numero_agencia: client.bank.agency,
				digito_agencia: client.bank.agency_digit,
				numero_conta: client.bank.account,
				digito_conta: client.bank.account_digit,
			},
			codigo_origem_6: process.env.SOURCE_CODE_6,
			numero_cpf_certificado: process.env.DOCUMENT_NUMBER_CERTIFICATE,
		},
		{
			headers: {
				Authorization: access_token,
			},
		},
	)

	const { numero_proposta: proposal_number } = data

	return { proposal_number }
}
