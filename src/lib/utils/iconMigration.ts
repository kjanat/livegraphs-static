/**
 * Icon Migration Map
 * Maps custom icon names to Lucide React equivalents
 */

export const iconMigrationMap = {
  // Direct mappings
  UploadIcon: "Upload",
  DownloadIcon: "Download",
  TrashIcon: "Trash2",
  ChartIcon: "BarChart3",
  CalendarIcon: "Calendar",
  FileIcon: "File",
  ExpandIcon: "Expand",
  SpinnerIcon: "Loader2", // Loader2 has built-in spin animation
  InfoIcon: "Info",
  AlertTriangleIcon: "AlertTriangle",
  CheckCircleIcon: "CheckCircle",
  TrendingUpIcon: "TrendingUp",
  TrendingDownIcon: "TrendingDown",
  ChevronDownIcon: "ChevronDown",
  ChevronUpIcon: "ChevronUp",
  AlertCircleIcon: "AlertCircle",
  BarChart3Icon: "BarChart3",
  MessageSquareIcon: "MessageSquare",
  UsersIcon: "Users",
  XIcon: "X"
} as const;

// Lucide React imports all these icons
export const lucideImports = Object.values(iconMigrationMap).join(", ");
