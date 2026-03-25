import superjson from "superjson"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Bank } from "@/enum/bank"

interface UserBank {
	type: Bank | ""
	code: string
	agency: string
	agency_digit: string
	account: string
	account_digit: string
}

interface UserBankState {
	data: UserBank

	update: (data: UserBank) => void
	clean: () => void
}

export const useUserBankZustand = create<UserBankState>()(
	persist(
		(set) => ({
			data: {
				type: "",
				code: "",
				agency: "",
				agency_digit: "",
				account: "",
				account_digit: "",
			},
			update: ({
				type,
				code,
				agency,
				agency_digit,
				account,
				account_digit,
			}: UserBank) =>
				set({
					data: { type, code, agency, agency_digit, account, account_digit },
				}),
			clean: () =>
				set({
					data: {
						type: "",
						code: "",
						agency: "",
						agency_digit: "",
						account: "",
						account_digit: "",
					},
				}),
		}),
		{
			name: "user-bank-zustand",
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
