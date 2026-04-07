"use server"

import axios from "axios"
import { TypeSimulation } from "@/enum/type_simulation"
import { get_access_token } from "./get-access-token"

interface get_simulation_req {
	document: string
	type_simulation: TypeSimulation
	amount?: number
	instalment?: number
}

interface get_simulation_res {
	simulation_id: string
	installments: number
	requested_amount: number
	principal_amount: number
	installment_amount: number
	gross_amount: number
	iof_amount: number
	net_amount: number
	client_amount: number
	first_due_date: string | Date
	last_due_date: string | Date
	monthly_effective_total_cost: number
	annual_effective_total_cost: number
	monthly_client_rate: number
	annual_client_rate: number
}

export async function get_simulation({
	document,
	type_simulation,
	amount,
	instalment,
}: get_simulation_req): Promise<get_simulation_res | null> {
	const { access_token } = await get_access_token()

	switch (type_simulation) {
		case TypeSimulation.MAX: {
			try {
				const { data } = await axios.post(
					"https://marketplace-proposal-service-api-p.c6bank.info/marketplace/worker-payroll-loan-offers/simulation",
					{
						cpf: document,
						tipo_simulacao: TypeSimulation.MAX,
					},
					{
						headers: {
							Authorization: access_token,
						},
					},
				)

				console.log(data)

				const { condicoes_credito } = data

				const { condicao } = condicoes_credito[0]

				const {
					id_simulacao: simulation_id,
					quantidade_parcelas: installments,
					valor_solicitado: requested_amount,
					valor_principal: principal_amount,
					valor_parcela: installment_amount,
					valor_bruto: gross_amount,
					valor_iof: iof_amount,
					valor_liquido: net_amount,
					valor_cliente: client_amount,
					data_primeiro_vencimento: first_due_date,
					data_ultimo_vencimento: last_due_date,
					custo_total_efetivo_mensal: monthly_effective_total_cost,
					custo_total_efetivo_anual: annual_effective_total_cost,
					taxa_cliente_mensal: monthly_client_rate,
					taxa_cliente_anual: annual_client_rate,
				} = condicao

				return {
					simulation_id,
					installments,
					requested_amount,
					principal_amount,
					installment_amount,
					gross_amount,
					iof_amount,
					net_amount,
					client_amount,
					first_due_date,
					last_due_date,
					monthly_effective_total_cost,
					annual_effective_total_cost,
					monthly_client_rate,
					annual_client_rate,
				}
			} catch (err) {
				console.dir(err, { depth: null })
				return null
			}
		}

		case TypeSimulation.AMOUNT: {
			try {
				const { data } = await axios.post(
					"https://marketplace-proposal-service-api-p.c6bank.info/marketplace/worker-payroll-loan-offers/simulation",
					{
						cpf: document,
						tipo_simulacao: TypeSimulation.AMOUNT,
						valor_solicitado: amount,
						prazo: instalment,
					},
					{
						headers: {
							Authorization: access_token,
						},
					},
				)

				const { condicoes_credito } = data

				const { condicao } = condicoes_credito[0]

				const {
					id_simulacao: simulation_id,
					quantidade_parcelas: installments,
					valor_solicitado: requested_amount,
					valor_principal: principal_amount,
					valor_parcela: installment_amount,
					valor_bruto: gross_amount,
					valor_iof: iof_amount,
					valor_liquido: net_amount,
					valor_cliente: client_amount,
					data_primeiro_vencimento: first_due_date,
					data_ultimo_vencimento: last_due_date,
					custo_total_efetivo_mensal: monthly_effective_total_cost,
					custo_total_efetivo_anual: annual_effective_total_cost,
					taxa_cliente_mensal: monthly_client_rate,
					taxa_cliente_anual: annual_client_rate,
				} = condicao

				return {
					simulation_id,
					installments,
					requested_amount,
					principal_amount,
					installment_amount,
					gross_amount,
					iof_amount,
					net_amount,
					client_amount,
					first_due_date,
					last_due_date,
					monthly_effective_total_cost,
					annual_effective_total_cost,
					monthly_client_rate,
					annual_client_rate,
				}
			} catch (err) {
				console.dir(err, { depth: null })
				console.error(err, { depth: null })
				return null
			}
		}
	}
}
