import { randomUUID } from "crypto"
import { cookies } from "next/headers"

export async function getSessionId(): Promise<string> {
	const cookieStore = await cookies()
	const existing = cookieStore.get("session_id")?.value

	if (existing) return existing

	const sessionId = randomUUID()

	cookieStore.set("session_id", sessionId, {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
	})

	return sessionId
}
