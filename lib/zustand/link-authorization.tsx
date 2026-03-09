import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import superjson from 'superjson'

interface LinkAuthorization {
    link: string
}

interface LinkAuthorizationState {
  data: LinkAuthorization
  update: (link: string) => void
  clean: () => void
}

export const useLinkAuthorizationZustand = create<LinkAuthorizationState>()(
  persist(
    (set) => ({
      data: {
        link: "",
      },
      update: (link) => set({ data: { link } }),
      clean: () => set({ data: { link: "" } }),
    }),
    {
      name: 'link-authorization-zustand',
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