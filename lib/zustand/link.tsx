import superjson from "superjson"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Link {
	link: string | null
	expiration_date: string | null
}

interface LinkState {
	data: Link

	clean: () => void
	update: (link: string, expiration_date: string) => void
}

export const useLinkZustand = create<LinkState>()(
	persist(
		(set) => ({
			data: {
				link: null,
				expiration_date: null,
			},
			clean: () => {
				set({
					data: {
						link: null,
						expiration_date: null,
					},
				})
			},
			update: (link: string, expiration_date: string) => {
				set({
					data: {
						link,
						expiration_date,
					},
				})
			},
		}),
		{
			name: "user-link-zustand",
			storage: {
				getItem: (name) => {
					const str = localStorage.getItem(name)
					return str ? (superjson.parse(str) as any) : null
				},
				setItem: (name, value) =>
					localStorage.setItem(name, superjson.stringify(value)),
				removeItem: (name) => localStorage.removeItem(name),
			},
		},
	),
)
