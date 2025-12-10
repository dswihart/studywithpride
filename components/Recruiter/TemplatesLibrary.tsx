/**
 * TemplatesLibrary
 *
 * Re-export from refactored component directory.
 * This file maintains backwards compatibility for existing imports.
 *
 * The component has been split into smaller, focused components:
 * - TemplatesLibrary/index.tsx - Main orchestrating component
 * - TemplatesLibrary/types.ts - Shared types
 * - TemplatesLibrary/useTemplates.ts - Data fetching hook
 * - TemplatesLibrary/TemplateCard.tsx - Template card component
 * - TemplatesLibrary/QuickMessageCard.tsx - Quick message card
 * - TemplatesLibrary/SendModal.tsx - Send dialog
 * - TemplatesLibrary/StudentSelectModal.tsx - Student selection
 * - TemplatesLibrary/LeadSelectModal.tsx - Lead selection
 * - TemplatesLibrary/AddTemplateModal.tsx - Add template form
 * - TemplatesLibrary/PreviewModal.tsx - Preview modal
 */

export { default, TemplatesLibrary } from "./TemplatesLibrary/index"
export type {
  Category,
  Template,
  QuickMessage,
  Lead,
  PortalStudent,
  TemplatesLibraryProps,
} from "./TemplatesLibrary/types"
