import { CostCategory } from '@/lib/types/cost'

type CityCode = 'barcelona' | 'madrid' | 'valencia'

// Barcelona costs (baseline - higher cost of living)
const barcelonaCosts: CostCategory[] = [
  {
    category: 'Accommodation',
    categoryEs: 'Alojamiento',
    saver: 450,
    moderate: 650,
    spender: 950,
    description: 'Shared apartment room in student-friendly neighborhoods',
    descriptionEs: 'Habitación compartida en barrios estudiantiles'
  },
  {
    category: 'Groceries & Food',
    categoryEs: 'Comida y Supermercado',
    saver: 220,
    moderate: 320,
    spender: 480,
    description: 'Home cooking with occasional dining out',
    descriptionEs: 'Cocinar en casa con salidas ocasionales'
  },
  {
    category: 'Transportation',
    categoryEs: 'Transporte',
    saver: 40,
    moderate: 55,
    spender: 80,
    description: 'TMB monthly pass or bicycle',
    descriptionEs: 'Abono mensual TMB o bicicleta'
  },
  {
    category: 'Utilities',
    categoryEs: 'Servicios',
    saver: 55,
    moderate: 75,
    spender: 105,
    description: 'Electricity, water, internet (often shared)',
    descriptionEs: 'Electricidad, agua, internet (usualmente compartido)'
  },
  {
    category: 'Mobile Phone',
    categoryEs: 'Teléfono Móvil',
    saver: 10,
    moderate: 20,
    spender: 35,
    description: 'Prepaid or contract plan',
    descriptionEs: 'Plan prepago o contrato'
  },
  {
    category: 'Leisure & Entertainment',
    categoryEs: 'Ocio y Entretenimiento',
    saver: 120,
    moderate: 220,
    spender: 420,
    description: 'Nightlife, cultural events, beach activities',
    descriptionEs: 'Vida nocturna, eventos culturales, playa'
  },
  {
    category: 'Personal Care',
    categoryEs: 'Cuidado Personal',
    saver: 35,
    moderate: 55,
    spender: 85,
    description: 'Toiletries, haircuts, basic healthcare items',
    descriptionEs: 'Artículos de aseo, peluquería, salud básica'
  },
  {
    category: 'Study Materials',
    categoryEs: 'Material de Estudio',
    saver: 30,
    moderate: 50,
    spender: 80,
    description: 'Books, supplies, printing',
    descriptionEs: 'Libros, material, impresiones'
  },
  {
    category: 'Miscellaneous',
    categoryEs: 'Gastos Varios',
    saver: 45,
    moderate: 85,
    spender: 160,
    description: 'Unexpected expenses, clothing, gifts',
    descriptionEs: 'Gastos imprevistos, ropa, regalos'
  }
]

// Madrid costs (slightly lower than Barcelona)
const madridCosts: CostCategory[] = [
  {
    category: 'Accommodation',
    categoryEs: 'Alojamiento',
    saver: 420,
    moderate: 620,
    spender: 900,
    description: 'Shared apartment room in student-friendly neighborhoods',
    descriptionEs: 'Habitación compartida en barrios estudiantiles'
  },
  {
    category: 'Groceries & Food',
    categoryEs: 'Comida y Supermercado',
    saver: 210,
    moderate: 310,
    spender: 470,
    description: 'Home cooking with occasional dining out',
    descriptionEs: 'Cocinar en casa con salidas ocasionales'
  },
  {
    category: 'Transportation',
    categoryEs: 'Transporte',
    saver: 35,
    moderate: 55,
    spender: 75,
    description: 'Metro/bus monthly pass or bicycle',
    descriptionEs: 'Abono mensual metro/bus o bicicleta'
  },
  {
    category: 'Utilities',
    categoryEs: 'Servicios',
    saver: 50,
    moderate: 70,
    spender: 100,
    description: 'Electricity, water, internet (often shared)',
    descriptionEs: 'Electricidad, agua, internet (usualmente compartido)'
  },
  {
    category: 'Mobile Phone',
    categoryEs: 'Teléfono Móvil',
    saver: 10,
    moderate: 20,
    spender: 35,
    description: 'Prepaid or contract plan',
    descriptionEs: 'Plan prepago o contrato'
  },
  {
    category: 'Leisure & Entertainment',
    categoryEs: 'Ocio y Entretenimiento',
    saver: 110,
    moderate: 210,
    spender: 410,
    description: 'Nightlife, cultural events, museums',
    descriptionEs: 'Vida nocturna, eventos culturales, museos'
  },
  {
    category: 'Personal Care',
    categoryEs: 'Cuidado Personal',
    saver: 32,
    moderate: 52,
    spender: 82,
    description: 'Toiletries, haircuts, basic healthcare items',
    descriptionEs: 'Artículos de aseo, peluquería, salud básica'
  },
  {
    category: 'Study Materials',
    categoryEs: 'Material de Estudio',
    saver: 30,
    moderate: 50,
    spender: 80,
    description: 'Books, supplies, printing',
    descriptionEs: 'Libros, material, impresiones'
  },
  {
    category: 'Miscellaneous',
    categoryEs: 'Gastos Varios',
    saver: 42,
    moderate: 82,
    spender: 155,
    description: 'Unexpected expenses, clothing, gifts',
    descriptionEs: 'Gastos imprevistos, ropa, regalos'
  }
]

// Valencia costs (most affordable of the three)
const valenciaCosts: CostCategory[] = [
  {
    category: 'Accommodation',
    categoryEs: 'Alojamiento',
    saver: 350,
    moderate: 550,
    spender: 800,
    description: 'Shared apartment room in student-friendly neighborhoods',
    descriptionEs: 'Habitación compartida en barrios estudiantiles'
  },
  {
    category: 'Groceries & Food',
    categoryEs: 'Comida y Supermercado',
    saver: 190,
    moderate: 280,
    spender: 430,
    description: 'Home cooking with occasional dining out',
    descriptionEs: 'Cocinar en casa con salidas ocasionales'
  },
  {
    category: 'Transportation',
    categoryEs: 'Transporte',
    saver: 35,
    moderate: 50,
    spender: 70,
    description: 'Metro/bus monthly pass or bicycle',
    descriptionEs: 'Abono mensual metro/bus o bicicleta'
  },
  {
    category: 'Utilities',
    categoryEs: 'Servicios',
    saver: 48,
    moderate: 68,
    spender: 95,
    description: 'Electricity, water, internet (often shared)',
    descriptionEs: 'Electricidad, agua, internet (usualmente compartido)'
  },
  {
    category: 'Mobile Phone',
    categoryEs: 'Teléfono Móvil',
    saver: 10,
    moderate: 20,
    spender: 35,
    description: 'Prepaid or contract plan',
    descriptionEs: 'Plan prepago o contrato'
  },
  {
    category: 'Leisure & Entertainment',
    categoryEs: 'Ocio y Entretenimiento',
    saver: 95,
    moderate: 190,
    spender: 380,
    description: 'Nightlife, cultural events, beach activities',
    descriptionEs: 'Vida nocturna, eventos culturales, playa'
  },
  {
    category: 'Personal Care',
    categoryEs: 'Cuidado Personal',
    saver: 28,
    moderate: 48,
    spender: 75,
    description: 'Toiletries, haircuts, basic healthcare items',
    descriptionEs: 'Artículos de aseo, peluquería, salud básica'
  },
  {
    category: 'Study Materials',
    categoryEs: 'Material de Estudio',
    saver: 30,
    moderate: 50,
    spender: 80,
    description: 'Books, supplies, printing',
    descriptionEs: 'Libros, material, impresiones'
  },
  {
    category: 'Miscellaneous',
    categoryEs: 'Gastos Varios',
    saver: 38,
    moderate: 75,
    spender: 145,
    description: 'Unexpected expenses, clothing, gifts',
    descriptionEs: 'Gastos imprevistos, ropa, regalos'
  }
]

export const cityCosts: Record<CityCode, CostCategory[]> = {
  barcelona: barcelonaCosts,
  madrid: madridCosts,
  valencia: valenciaCosts
}

export const cities = [
  { code: 'barcelona' as CityCode, name: 'Barcelona', nameEs: 'Barcelona' },
  { code: 'madrid' as CityCode, name: 'Madrid', nameEs: 'Madrid' },
  { code: 'valencia' as CityCode, name: 'Valencia', nameEs: 'Valencia' }
]
