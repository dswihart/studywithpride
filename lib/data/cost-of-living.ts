import { CostCategory } from '@/lib/types/cost'

export const costCategories: CostCategory[] = [
  {
    category: 'Accommodation',
    categoryEs: 'Alojamiento',
    saver: 400,
    moderate: 600,
    spender: 900,
    description: 'Shared apartment room in student-friendly neighborhoods',
    descriptionEs: 'Habitación compartida en barrios estudiantiles'
  },
  {
    category: 'Groceries & Food',
    categoryEs: 'Comida y Supermercado',
    saver: 200,
    moderate: 300,
    spender: 450,
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
    saver: 100,
    moderate: 200,
    spender: 400,
    description: 'Nightlife, cultural events, beach activities',
    descriptionEs: 'Vida nocturna, eventos culturales, playa'
  },
  {
    category: 'Personal Care',
    categoryEs: 'Cuidado Personal',
    saver: 30,
    moderate: 50,
    spender: 80,
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
    saver: 40,
    moderate: 80,
    spender: 150,
    description: 'Unexpected expenses, clothing, gifts',
    descriptionEs: 'Gastos imprevistos, ropa, regalos'
  }
]
