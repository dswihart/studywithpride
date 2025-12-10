/**
 * TemplatesLibrary Utilities
 */

import {
  DocumentTextIcon,
  CreditCardIcon,
  GlobeAltIcon,
  HomeIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  MapIcon,
  HeartIcon,
  DocumentIcon,
  PhotoIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline"

export const iconMap: Record<string, React.ElementType> = {
  FileText: DocumentTextIcon,
  CreditCard: CreditCardIcon,
  Globe: GlobeAltIcon,
  Home: HomeIcon,
  Briefcase: BriefcaseIcon,
  Calendar: CalendarIcon,
  CheckSquare: CheckIcon,
  Map: MapIcon,
  Heart: HeartIcon,
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return ""
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

export function getFileIcon(fileType: string): React.ReactNode {
  const iconClass = "w-5 h-5"
  switch (fileType) {
    case "pdf":
      return <DocumentTextIcon className={`${iconClass} text-red-500`} />
    case "docx":
      return <DocumentIcon className={`${iconClass} text-blue-500`} />
    case "image":
      return <PhotoIcon className={`${iconClass} text-green-500`} />
    case "url":
      return <ArrowTopRightOnSquareIcon className={`${iconClass} text-purple-500`} />
    default:
      return <DocumentTextIcon className={`${iconClass} text-gray-500`} />
  }
}

export function getCategoryIcon(iconName: string): React.ReactNode {
  const Icon = iconMap[iconName] || DocumentTextIcon
  return <Icon className="w-4 h-4" />
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}
