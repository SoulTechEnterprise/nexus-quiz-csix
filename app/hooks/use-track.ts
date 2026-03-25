import { track_event } from "@/app/actions/track-event"
import { GoogleTagManager } from "@/enum/google-tag-manager"
import { useUserIdentificationZustand } from "@/lib/zustand/user-identification"

type TrackParams = {
	event: GoogleTagManager
	data?: Record<string, unknown>
}

export function useTrack() {
	const {
		data: { document },
	} = useUserIdentificationZustand()

	const track = async ({ event, data = {} }: TrackParams) => {
		return await track_event({
			event,
			data,
			document: document || null,
		})
	}

	return { track }
}
