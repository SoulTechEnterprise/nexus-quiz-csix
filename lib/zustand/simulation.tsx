import superjson from "superjson"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Simulation {
	simulation_id: string // id_simulacao
	installments: number | null // quantidade_parcelas
	requested_amount: number | null // valor_solicitado
	principal_amount: number | null // valor_principal
	installment_amount: number | null // valor_parcela
	gross_amount: number | null // valor_bruto
	iof_amount: number | null // valor_iof
	net_amount: number | null // valor_liquido
	client_amount: number | null // valor_cliente
	first_due_date: Date | string // data_primeiro_vencimento
	last_due_date: Date | string // data_ultimo_vencimento
	monthly_effective_total_cost: number | null // custo_total_efetivo_mensal
	annual_effective_total_cost: number | null // custo_total_efetivo_anual
	monthly_client_rate: number | null // taxa_cliente_mensal
	annual_client_rate: number | null // taxa_cliente_anual
}

interface SimulationState {
	data: Simulation

	update: (data: Partial<Simulation>) => void
	clean: () => void
}

const initialState: Simulation = {
	simulation_id: "",
	installments: null,
	requested_amount: null,
	principal_amount: null,
	installment_amount: null,
	gross_amount: null,
	iof_amount: null,
	net_amount: null,
	client_amount: null,
	first_due_date: "",
	last_due_date: "",
	monthly_effective_total_cost: null,
	annual_effective_total_cost: null,
	monthly_client_rate: null,
	annual_client_rate: null,
}

export const useSimulationZustand = create<SimulationState>()(
	persist(
		(set) => ({
			data: initialState,

			update: (newData) =>
				set((state) => ({ data: { ...state.data, ...newData } })),

			clean: () => set({ data: initialState }),
		}),
		{
			name: "simulation-condition-zustand",
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
