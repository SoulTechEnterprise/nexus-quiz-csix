"use server"

import { Sex } from "@/enum/sex"
import axios from "axios"

export interface get_client_info_req {
    document: string
}

export interface get_client_info_res {
    name: string
    sex: Sex
    date_birth: Date
}

export interface get_client_info_error {
    error: string
    message: string
    code: string
}

export type action_response = 
    | { success: true, data: get_client_info_res }
    | { success: false, data: get_client_info_error }

export async function get_client_info({ document }: get_client_info_req): Promise<action_response> {
    try {
        const { data: body } = await axios.get(`https://api.cpf-brasil.org/cpf/${document}`, {
            headers: {
                "X-API-Key": process.env.CPFBRASIL_TOKEN
            }
        })

        const { data } = body

        const { NOME: name, SEXO: sex, NASC: date_birth } = data

        return { success: true, data: { name, sex, date_birth } }

    } catch (error) {

        if (axios.isAxiosError<get_client_info_error>(error)) {
            const { response } = error
            const { data } = response!
            const { error: _error, code, message } = data!

            return { 
                success: false, 
                data: {
                    error: _error,
                    code,
                    message
                }
            }
        }

        return { success: false, data: { code: "UNKNOWN", error: "Erro interno no servidor", message: "Avise nosso suporte para resolvermos isso" } }
    }
}