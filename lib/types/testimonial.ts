export interface Testimonial {
  id: string
  name: string
  country: string
  program: string
  quote: string
  photo: string
  approved: boolean
  createdAt: string
}

export interface CommunityResource {
  id: string
  name: string
  type: string
  description: string
  url?: string
  phone?: string
  address?: string
}
