/**
 * Service Layer Index
 *
 * Export all services for easy importing throughout the application.
 * Services contain business logic separated from API routes.
 *
 * Usage:
 * import { LeadService, ConversionService, ContactService } from "@/lib/services"
 */

export { LeadService } from "./LeadService"
export { ConversionService } from "./ConversionService"
export { ContactService } from "./ContactService"

// Re-export types
export type {
  ServiceResult,
  PaginatedResult,
  PaginationParams,
  LeadFilters,
  Lead,
  LeadUpdate,
  ConversionRequest,
  ConversionResult,
  ContactLogEntry
} from "./types"
