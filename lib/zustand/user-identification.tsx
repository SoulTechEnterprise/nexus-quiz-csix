import superjson from "superjson"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { GoogleTagManager } from "@/enum/google-tag-manager"
import type { Sex } from "@/enum/sex"

export interface UserIdentification {
	name: string
	sex: Sex | ""
	date_birth: string
	document: string
	phone?: string
}

interface UserIdentificationState {
	data: UserIdentification
	authorized: GoogleTagManager | null

	update: (data: UserIdentification) => void
	clean: () => void
	auth: (authorized: GoogleTagManager) => void
}

export const useUserIdentificationZustand = create<UserIdentificationState>()(
	persist(
		(set) => ({
			data: {
				name: "",
				sex: "",
				date_birth: "",
				document: "",
				phone: "",
			},
			authorized: null,
			update: ({
				name,
				sex,
				date_birth,
				document,
				phone,
			}: UserIdentification) =>
				set({ data: { name, sex, date_birth, document, phone } }),
			clean: () =>
				set({
					data: {
						name: "",
						sex: "",
						date_birth: "",
						document: "",
						phone: "",
					},
				}),
			auth: (authorized: GoogleTagManager) => {
				set({
					authorized,
				})
			},
		}),
		{
			name: "user-identification-zustand",
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
