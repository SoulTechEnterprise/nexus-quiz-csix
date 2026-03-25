import superjson from "superjson"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Simulation {
	simulation_id: string // id_simulacao
	installments: number | "" // quantidade_parcelas
	requested_amount: number | "" // valor_solicitado
	principal_amount: number | "" // valor_principal
	installment_amount: number | "" // valor_parcela
	gross_amount: number | "" // valor_bruto
	iof_amount: number | "" // valor_iof
	net_amount: number | "" // valor_liquido
	client_amount: number | "" // valor_cliente
	first_due_date: Date | string // data_primeiro_vencimento
	last_due_date: Date | string // data_ultimo_vencimento
	monthly_effective_total_cost: number | "" // custo_total_efetivo_mensal
	annual_effective_total_cost: number | "" // custo_total_efetivo_anual
	monthly_client_rate: number | "" // taxa_cliente_mensal
	annual_client_rate: number | "" // taxa_cliente_anual
}

interface SimulationState {
	data: Simulation

	update: (data: Partial<Simulation>) => void
	clean: () => void
}

const initialState: Simulation = {
	simulation_id: "",
	installments: "",
	requested_amount: "",
	principal_amount: "",
	installment_amount: "",
	gross_amount: "",
	iof_amount: "",
	net_amount: "",
	client_amount: "",
	first_due_date: "",
	last_due_date: "",
	monthly_effective_total_cost: "",
	annual_effective_total_cost: "",
	monthly_client_rate: "",
	annual_client_rate: "",
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
