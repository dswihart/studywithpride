/**
 * WhatsApp Message Templates
 * Shared template definitions and expansion utilities
 */

export interface MessageTemplate {
  id: string
  name: string
  category: string
  description: string
  body: string
  params: number
}

export const WHATSAPP_TEMPLATES: MessageTemplate[] = [
  {
    id: "welcome_message",
    name: "Welcome Message",
    category: "UTILITY",
    description: "Initial welcome message for new leads",
    body: "Hello {{1}},\nThank you for your interest in studying abroad with C3S Barcelona Business School. I'm here to guide you through your {{2}} study options and answer any questions you may have. To get started, could you please share your preferred intake month and your current level of studies?\n\nLooking forward to assisting you.",
    params: 2
  },
  {
    id: "follow_up",
    name: "Follow Up",
    category: "UTILITY",
    description: "Follow up message for contacted leads",
    body: "Hi {{1}},\n\nFollowing up on your study abroad inquiry for {{2}}. Do you have time this week to discuss your application options?\n\nBest regards,\n{{3}} - C3S Barcelona Business School",
    params: 3
  },
  {
    id: "application_reminder",
    name: "Application Reminder",
    category: "UTILITY",
    description: "Reminder about application deadlines",
    body: "Hi {{1}},\n\nThis is a friendly reminder about your {{2}} application. The deadline is approaching on {{3}}. Let us know if you need assistance!\n\nC3S Barcelona Business School Team",
    params: 3
  }
]

/**
 * Expand a template by replacing {{1}}, {{2}}, etc. with actual parameter values
 */
export function expandTemplate(templateBody: string, params: string[]): string {
  let expanded = templateBody
  params.forEach((param, index) => {
    const placeholder = `{{${index + 1}}}`
    expanded = expanded.replace(new RegExp(placeholder.replace(/[{}]/g, '\$&'), 'g'), param)
  })
  return expanded
}

/**
 * Get template by ID
 */
export function getTemplate(templateId: string): MessageTemplate | undefined {
  return WHATSAPP_TEMPLATES.find(t => t.id === templateId)
}
