"use server"

import axios from "axios"

interface send_message_to_whatsapp_req {
    name: string
    phone: string
    link: string
}

export async function send_message_to_whatsapp({ name, phone, link }: send_message_to_whatsapp_req) {
    axios.post(`https://nexus-evolution-api.soultech.agency/message/sendText/Nexus`, {
        number: `55${phone}`,
        text: `Olá, ${name}! 🏦\n\nSeus dados foram recebidos e estão confirmados. ✅\n\nPara liberar o seu empréstimo, clique no link abaixo e autorize a operação:\n\n👉 ${link}\n\n🔒 O Nexus nunca solicita senhas ou códigos. Não compartilhe este link.`,
        delay: 1200,
        linkPreview: false
        }, {
        headers: {
            apikey: process.env.EVOLUTION_API_KEY
        }
    })
}