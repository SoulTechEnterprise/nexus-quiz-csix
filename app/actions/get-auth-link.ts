"use server"

import axios from "axios"

interface get_auth_link_req {
    name: string
    document: string
    date_birth: Date
}

interface get_auth_link_res {
    link: string
}

export async function get_auth_link({ name, document, date_birth }: get_auth_link_req): Promise<get_auth_link_res> {
    const { data } = await axios.post("https://marketplace-proposal-service-api-p.c6bank.info/marketplace/authorization/generate-liveness", {}, {})

    const { link } = data

    return { link }
}