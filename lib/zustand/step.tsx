import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import superjson from 'superjson'

import { Step } from "@/enum/step"

interface StepState {
  step: Step
  length: number
  update: (step: Step) => void
  clean: () => void
}

export const useStepZustand = create<StepState>()(
  persist(
    (set) => ({
      step: Step.USER_IDENTIFICATION,
      length: 0,

      update: (step) => set({ step, length: length + 1 }),

      clean: () => set({ step: Step.USER_IDENTIFICATION }),
    }),
    {
      name: 'step-zustand',
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