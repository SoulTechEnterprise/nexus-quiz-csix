import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import superjson from 'superjson'
import { Sex } from '@/enum/sex'

interface UserAddress {
  zip_code: string
  street: string
  number: string
  district: string
  city: string
  state: string
  complement: string
}

interface UserAddressState {
  data: UserAddress

  update: (data: UserAddress) => void
  clean: () => void
}

export const useUserAddressZustand = create<UserAddressState>()(
  persist(
    (set) => ({
      data: {
        zip_code: "",
        street: "",
        number: "",
        district: "",
        city: "",
        state: "",
        complement: ""
      },
      update: ({ zip_code, street, number, district, city, state, complement }: UserAddress) => set({ data: { zip_code, street, number, district, city, state, complement } }),
      clean: () => set({ data: { zip_code: "", street: "", number: "", district: "", city: "", state: "", complement: "" } }),
    }),
    {
      name: 'user-address-zustand',
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