"use server"

import axios from "axios"
import { get_access_token } from "./get-access-token"

interface get_auth_loan_req {
    proposal_number: string
}

interface get_auth_loan_res {
    link: string
}

export async function get_auth_loan({ proposal_number }: get_auth_loan_req): Promise<get_auth_loan_res> {
    const { access_token } = await get_access_token()

    const { data } = await axios.get(`https://marketplace-proposal-service-api-p.c6bank.info/marketplace/proposal/formalization-url?proposalNumber=${proposal_number}`, {
        headers: {
            Authorization: access_token
        }
    })

    const { url: link } = data

    return { link }
}