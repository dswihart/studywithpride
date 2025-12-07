export interface ProgramDetails {
  id: string
  name: string
  duration: string
  credits: string
  tuitionOnCampus: number
  tuitionOnline?: number
  registrationFee: number
  language: string
  deliveryModes: string[]
  intakes: string[]
  awardingBodies: string[]
  description: string
  structure?: string[]
  admissionRequirements?: string[]
}

export interface University {
  id: string
  name: string
  shortName: string
  location: string
  description: string
  programs: string[]
  programDetails?: ProgramDetails[]
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
    programDetails: [
      {
        id: 'mba-project-management',
        name: 'MBA with Project Management',
        duration: '18 months (12 months OTHM Level 7 + 6 months MBA Top-up)',
        credits: '90 ECTS',
        tuitionOnCampus: 10800,
        tuitionOnline: 10300,
        registrationFee: 300,
        language: 'English',
        deliveryModes: ['On Campus (Barcelona)', 'Online'],
        intakes: ['October'],
        awardingBodies: ['OTHM Qualifications', 'Abertay University UK'],
        description: 'The OTHM Level 7 Diploma in Project Management followed by MBA top-up from Abertay University. This program develops skills for project managers in global sectors, covering strategy, risk management, budgeting, international regulations, and sustainability.',
        structure: [
          'OTHM Level 7 Diploma in Project Management (12 months):',
          '- Planning, Controlling and Leading a Project',
          '- Procurement, Risk and Quality in Project Management',
          '- Advanced Project Management',
          '- Project Management in a Global Environment',
          '- Sustainability in Project Management',
          '- Contemporary Issues in Project Management',
          'MBA Top-up (6 months):',
          '- Strategic Management for Leaders (Dissertation)',
        ],
        admissionRequirements: [
          'Bachelor Degree in any discipline from a recognized university',
          'IELTS 6.5 or equivalent English proficiency',
          'Academic transcripts and certificates',
          'Valid passport',
          'Statement of Purpose (SOP)',
          'CV/Resume',
          'Two reference letters',
        ],
      },
    ],
  },
]

export function getUniversityById(id: string): University | undefined {
  return universities.find(u => u.id === id)
}

export function getUniversitiesByLocation(location: string): University[] {
  return universities.filter(u => u.location.toLowerCase().includes(location.toLowerCase()))
}

export function getProgramDetails(universityId: string, programId: string): ProgramDetails | undefined {
  const university = getUniversityById(universityId)
  return university?.programDetails?.find(p => p.id === programId)
}

export function getProgramByName(universityId: string, programName: string): ProgramDetails | undefined {
  const university = getUniversityById(universityId)
  return university?.programDetails?.find(p => p.name.toLowerCase() === programName.toLowerCase())
}
