"use client"

import { useEffect } from 'react'
import * as CookieConsent from 'vanilla-cookieconsent'
import { config } from './config'

export function Cookies() {
    useEffect(() => {
        CookieConsent.run(config)
    }, [])

    return null
}
