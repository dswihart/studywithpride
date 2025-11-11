export interface University {
  id: string
  name: string
  shortName: string
  location: string
  description: string
  programs: string[]
  logoUrl?: string
}

export const universities: University[] = [
  {
    id: 'c3s',
    name: 'C3S Business School',
    shortName: 'C3S',
    location: 'Barcelona',
    description: 'International business school with over a decade of experience, ranked #1 for student satisfaction with 97% employment rate within 6 months of graduation.',
    programs: [
      'Global MBA',
      'MBA with Project Management',
      'Bachelor in Business Management',
      'Bachelor in Business Computing & Information Systems',
      'Bachelor in Business Tourism',
      'Doctorate of Business Administration (DBA)',
    ],
  },
]

export function getUniversityById(id: string): University | undefined {
  return universities.find(u => u.id === id)
}

export function getUniversitiesByLocation(location: string): University[] {
  return universities.filter(u => u.location.toLowerCase().includes(location.toLowerCase()))
}
