// CMS Data Layer - File-based storage utilities (Story 2.2-A)
import fs from 'fs/promises'
import path from 'path'
import { Testimonial, FinancialRequirement, VisaRequirementOverride } from '@/lib/types/cms'

const CMS_DATA_DIR = path.join(process.cwd(), 'cms-data')

/**
 * Read testimonials from CMS data store
 * AC 4: Read-only access for frontend
 */
export async function getTestimonials(approvedOnly: boolean = true): Promise<Testimonial[]> {
  try {
    const filePath = path.join(CMS_DATA_DIR, 'testimonials', 'data.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const testimonials: Testimonial[] = JSON.parse(fileContent)
    
    if (approvedOnly) {
      return testimonials.filter(t => t.approved === true)
    }
    
    return testimonials
  } catch (error) {
    console.error('Error reading testimonials:', error)
    return []
  }
}

/**
 * Write testimonials to CMS data store
 * AC 3: Admin-only write operation
 */
export async function saveTestimonials(testimonials: Testimonial[]): Promise<void> {
  try {
    const filePath = path.join(CMS_DATA_DIR, 'testimonials', 'data.json')
    await fs.writeFile(filePath, JSON.stringify(testimonials, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error saving testimonials:', error)
    throw new Error('Failed to save testimonials')
  }
}

/**
 * Approve a testimonial
 * NFR1: Content Approver role function
 */
export async function approveTestimonial(
  testimonialId: string,
  approverName: string
): Promise<boolean> {
  try {
    const testimonials = await getTestimonials(false)
    const testimonial = testimonials.find(t => t.id === testimonialId)
    
    if (!testimonial) {
      return false
    }
    
    testimonial.approved = true
    testimonial.approvedBy = approverName
    testimonial.approvedAt = new Date().toISOString()
    testimonial.updatedAt = new Date().toISOString()
    
    await saveTestimonials(testimonials)
    return true
  } catch (error) {
    console.error('Error approving testimonial:', error)
    return false
  }
}

/**
 * Reject a testimonial
 * NFR1: Content Approver role function
 */
export async function rejectTestimonial(testimonialId: string): Promise<boolean> {
  try {
    const testimonials = await getTestimonials(false)
    const testimonial = testimonials.find(t => t.id === testimonialId)
    
    if (!testimonial) {
      return false
    }
    
    testimonial.approved = false
    testimonial.updatedAt = new Date().toISOString()
    
    await saveTestimonials(testimonials)
    return true
  } catch (error) {
    console.error('Error rejecting testimonial:', error)
    return false
  }
}

/**
 * Add a new testimonial
 * AC 3: Admin-only operation
 */
export async function addTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<Testimonial> {
  try {
    const testimonials = await getTestimonials(false)
    
    const newTestimonial: Testimonial = {
      ...testimonial,
      id: `testimonial-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    testimonials.push(newTestimonial)
    await saveTestimonials(testimonials)
    
    return newTestimonial
  } catch (error) {
    console.error('Error adding testimonial:', error)
    throw new Error('Failed to add testimonial')
  }
}

/**
 * Get financial requirements
 */
export async function getFinancialRequirements(): Promise<FinancialRequirement[]> {
  try {
    const filePath = path.join(CMS_DATA_DIR, 'financial', 'data.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    // Return default data if file doesn't exist
    return [
      {
        id: 'iprem',
        category: 'Monthly Living',
        categoryEs: 'Vida Mensual',
        amount: 600,
        currency: 'EUR',
        description: 'IPREM minimum monthly requirement',
        descriptionEs: 'Requisito mínimo mensual IPREM',
        isMonthly: true,
        updatedAt: new Date().toISOString()
      }
    ]
  }
}

/**
 * Save financial requirements
 * AC 3: Admin-only operation
 */
export async function saveFinancialRequirements(requirements: FinancialRequirement[]): Promise<void> {
  try {
    const filePath = path.join(CMS_DATA_DIR, 'financial', 'data.json')
    await fs.writeFile(filePath, JSON.stringify(requirements, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error saving financial requirements:', error)
    throw new Error('Failed to save financial requirements')
  }
}
