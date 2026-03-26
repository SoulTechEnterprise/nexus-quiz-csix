"use server"

import { headers } from "next/headers"
import { GoogleTagManager } from "@/enum/google-tag-manager"
import clientPromise from "@/lib/mongodb"
import { getSessionId } from "@/lib/session-id"

// ─── Types ────────────────────────────────────────────────────────────────────

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

type EventEntry = {
	event: GoogleTagManager
	document: string | null
	timestamp: Date
	data: Record<string, unknown>
}

type SessionDocument = {
	session_id: string
	started_at: Date
	context: {
		userAgent: string
		ip: string
		geo: GeoLocation
	}
	events: EventEntry[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LOCAL_IPS = new Set(["unknown", "127.0.0.1", "::1"])

async function getGeoLocation(ip: string): Promise<GeoLocation> {
	if (LOCAL_IPS.has(ip) || ip.startsWith("192.168.")) {
		return null
	}

	try {
		const res = await fetch(
			`http://ip-api.com/json/${ip}?fields=country,regionName,city&lang=pt`,
			{ next: { revalidate: 3600 } }, // cache por 1h — mesmo IP não revalida a cada evento
		)

		if (!res.ok) return null

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

// ─── Action ───────────────────────────────────────────────────────────────────

export async function track_event({
	event,
	document,
	data = {},
}: TrackEventParams) {
	try {
		const db = (await clientPromise).db()
		const headersList = await headers()

		const rawIp = headersList.get("x-forwarded-for") ?? "unknown"
		const ip = rawIp.split(",")[0].trim()

		const [sessionId, geo] = await Promise.all([
			getSessionId(),
			getGeoLocation(ip),
		])

		const eventEntry: EventEntry = {
			event,
			document,
			timestamp: new Date(),
			data,
		}

		await db.collection<SessionDocument>("data").updateOne(
			{ session_id: sessionId },
			{
				$setOnInsert: {
					session_id: sessionId,
					started_at: new Date(),
					context: {
						userAgent: headersList.get("user-agent") ?? "unknown",
						ip,
						geo,
					},
				},
				$push: {
					events: eventEntry,
				},
			},
			{ upsert: true },
		)

		return { status: true }
	} catch (error) {
		console.error(`[trackEvent] ${event}:`, error)
		return { status: false }
	}
}
