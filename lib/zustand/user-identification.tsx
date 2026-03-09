import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import superjson from 'superjson'
import { Sex } from '@/enum/sex'

interface UserIdentification {
  name: string
  sex: Sex | ""
  date_birth: Date | ""
  document: string
}

interface UserIdentificationState {
  data: UserIdentification

  update: (data: UserIdentification) => void
  clean: () => void
}

export const useUserIdentificationZustand = create<UserIdentificationState>()(
  persist(
    (set) => ({
      data: {
        name: "",
        sex: "",
        date_birth: "",
        document: "",
      },
      update: ({ name, sex, date_birth, document }: UserIdentification) => set({ data: { name, sex, date_birth, document } }),
      clean: () => set({ data: { name: "", sex: "", date_birth: "", document: "" } }),
    }),
    {
      name: 'user-identification-zustand',
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