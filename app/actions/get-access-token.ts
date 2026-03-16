"use server"

import axios from "axios"

export interface get_client_info_res {
    access_token: string
}

export async function get_access_token(): Promise<get_client_info_res> {
    const { data } = await axios.post("https://marketplace-proposal-service-api-p.c6bank.info/auth/token", {
        username: process.env.USERNAME,
        password: process.env.PASSWORD
    }, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })

    const { access_token } = data

    return { access_token }
}