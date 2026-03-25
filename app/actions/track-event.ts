"use server"

import { headers } from "next/headers"
import { GoogleTagManager } from "@/enum/google-tag-manager"
import clientPromise from "@/lib/mongodb"
import { getSessionId } from "@/lib/session-id"

type TrackEventParams = {
	event: GoogleTagManager
	data?: Record<string, unknown>
	document: string | null
}

type GeoLocation = {
	country: string
	state: string
	city: string
} | null

async function getGeoLocation(ip: string): Promise<GeoLocation> {
	if (
		ip === "unknown" ||
		ip === "127.0.0.1" ||
		ip === "::1" ||
		ip.startsWith("192.168")
	) {
		return null
	}

	try {
		const res = await fetch(
			`http://ip-api.com/json/${ip}?fields=country,regionName,city&lang=pt`,
		)
		const data = await res.json()

		return {
			country: data.country ?? "unknown",
			state: data.regionName ?? "unknown",
			city: data.city ?? "unknown",
		}
	} catch {
		return null
	}
}

export async function track_event({
	event,
	document,
	data = {},
}: TrackEventParams) {
	try {
		const db = (await clientPromise).db()
		const headersList = await headers()

		const ip = headersList.get("x-forwarded-for") ?? "unknown"
		const geo = await getGeoLocation(ip.split(",")[0].trim())

		await db.collection("data").insertOne({
			event,
			session_id: await getSessionId(),
			timestamp: new Date(),
			document,
			context: {
				userAgent: headersList.get("user-agent") ?? "unknown",
				ip,
				geo,
			},
			data,
		})

		return { status: true }
	} catch (error) {
		console.error(`[track_event] ${event}:`, error)
		return { status: false }
	}
}
