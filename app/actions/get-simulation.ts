"use server"

import axios from "axios"
import { get_access_token } from "./get-access-token"

import { TypeSimulation } from "@/enum/type_simulation"

interface get_simulation_req {
  document: string
  type_simulation: TypeSimulation
  amount?: number
  instalment?: number
}

interface get_simulation_res {
    proposal_number: string
}

export async function get_simulation({ document, type_simulation, amount, instalment }: get_simulation_req): Promise<get_simulation_res> {
    const { access_token } = await get_access_token()

    switch(type_simulation) {
        case TypeSimulation.MAX:
            var { data } = await axios.post("https://marketplace-proposal-service-api-p.c6bank.info/marketplace/worker-payroll-loan-offers/simulation", {
                cpf: document,
                tipo_simulacao: TypeSimulation.MAX
            }, {
                headers: {
                    Authorization: access_token
                }
            })
            
            return data

        case TypeSimulation.AMOUNT: 
            var { data } = await axios.post("https://marketplace-proposal-service-api-p.c6bank.info/marketplace/worker-payroll-loan-offers/simulation", {
                cpf: document,
                tipo_simulacao: TypeSimulation.AMOUNT,
                valor_solicitado: amount,
                prazo: instalment
            }, {
                headers: {
                    Authorization: access_token
                }
            })

            return data
    }
}
