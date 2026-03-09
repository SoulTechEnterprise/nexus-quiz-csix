import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import superjson from 'superjson'
import { Bank } from '@/enum/bank'

interface UserBank {
  type: Bank | ""
  code: string
  agency: string
  account: string
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
        account: ""
      },
      update: ({ type, code, agency, account }: UserBank) => set({ data: { type, code, agency, account } }),
      clean: () => set({ data: { type: "", code: "", agency: "", account: "" } }),
    }),
    {
      name: 'user-bank-zustand',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          return str ? (superjson.parse(str) as any) : null
        },
        setItem: (name, value) => localStorage.setItem(name, superjson.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      }
    }
  )
)