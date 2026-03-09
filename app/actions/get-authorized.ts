"use server"

import { StatusAuthorizationLink } from "@/enum/status"
import axios from "axios"

interface get_authorized_req {
    document: string
}

interface get_authorized_res {
    status: StatusAuthorizationLink
}

export async function get_authorized({ document }: get_authorized_req): Promise<get_authorized_res> {
    const { data } = await axios.post("https://marketplace-proposal-service-api-p.c6bank.info/marketplace/authorization/status", {
        cpf: document
    }, {})

    const { status } = data

    return { status }
}