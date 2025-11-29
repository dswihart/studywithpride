import { CostCategory } from "@/lib/types/cost"

// Barcelona costs based on 2025 research (Numbeo, University Living)
const barcelonaCosts: CostCategory[] = [
  {
    category: "Tuition",
    categoryEs: "Matrícula",
    cost: 583,
    description: "Annual tuition fee (€7,000/year)",
    descriptionEs: "Matrícula anual (€7,000/año)"
  },
  {
    category: "Accommodation",
    categoryEs: "Alojamiento",
    cost: 500,
    description: "Shared apartment room (€400-€600 range)",
    descriptionEs: "Habitación en piso compartido"
  },
  {
    category: "Groceries & Food",
    categoryEs: "Comida y Supermercado",
    cost: 225,
    description: "Home cooking with occasional dining out",
    descriptionEs: "Cocinar en casa con salidas ocasionales"
  },
  {
    category: "Transportation",
    categoryEs: "Transporte",
    cost: 40,
    description: "T-usual monthly pass (Zone 1)",
    descriptionEs: "Abono T-usual mensual (Zona 1)"
  },
  {
    category: "Utilities",
    categoryEs: "Servicios",
    cost: 90,
    description: "Electricity, water, gas (shared)",
    descriptionEs: "Electricidad, agua, gas (compartido)"
  },
  {
    category: "Mobile & Internet",
    categoryEs: "Móvil e Internet",
    cost: 35,
    description: "Mobile plan + shared internet",
    descriptionEs: "Plan móvil + internet compartido"
  },
  {
    category: "Leisure & Entertainment",
    categoryEs: "Ocio y Entretenimiento",
    cost: 150,
    description: "Social activities, events, beach",
    descriptionEs: "Actividades sociales, eventos, playa"
  },
  {
    category: "Personal Care",
    categoryEs: "Cuidado Personal",
    cost: 50,
    description: "Toiletries, haircuts, healthcare",
    descriptionEs: "Artículos de aseo, peluquería, salud"
  },
  {
    category: "Study Materials",
    categoryEs: "Material de Estudio",
    cost: 30,
    description: "Books, supplies, printing",
    descriptionEs: "Libros, material, impresiones"
  },
  {
    category: "Miscellaneous",
    categoryEs: "Gastos Varios",
    cost: 70,
    description: "Unexpected expenses, clothing",
    descriptionEs: "Gastos imprevistos, ropa"
  }
]

export const cityCosts: Record<string, CostCategory[]> = {
  barcelona: barcelonaCosts
}

export const cities = [
  { code: "barcelona", name: "Barcelona", nameEs: "Barcelona" }
]
