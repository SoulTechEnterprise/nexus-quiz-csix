import superjson from "superjson"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { GoogleTagManager } from "@/enum/google-tag-manager"
import type { Sex } from "@/enum/sex"
import { StatusAuthorizationLink } from "@/enum/status"

export interface UserIdentification {
	name: string
	sex: Sex | ""
	date_birth: string
	document: string
	phone?: string
}

export interface UserIdentificationLink {
	url: string | null
	expiration_date: string | null
}

interface UserIdentificationState {
	data: UserIdentification
	authorized: StatusAuthorizationLink | null
	link: UserIdentificationLink

	update: (data: UserIdentification) => void
	clean: () => void
	auth: (authorized: StatusAuthorizationLink) => void
	update_link: (url: string, expiration_date: string) => void
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
			link: {
				url: null,
				expiration_date: null,
			},
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
					link: {
						url: null,
						expiration_date: null,
					},
					authorized: null,
				}),
			auth: (authorized: StatusAuthorizationLink) => {
				set({
					authorized,
				})
			},
			update_link: (url: string, expiration_date: string) => {
				set({
					link: {
						url,
						expiration_date,
					},
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
