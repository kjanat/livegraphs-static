import type { Locale } from "date-fns";
import type { LucideIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;

  // Duration constraints
  minDuration?: number; // in days
  maxDuration?: number;
  showDurationHint?: boolean;

  // Date constraints
  minDate?: Date;
  maxDate?: Date;

  // Presets
  presets?: Preset[];

  // Localization
  locale?: Locale;
  dateFormat?: string; // e.g. "dd/MM/yyyy"

  // Disabled days
  isDayDisabled?: (day: Date) => boolean;
  availableDates?: Set<string>; // For backwards compatibility

  // Responsive
  monthsMobile?: number;
  monthsDesktop?: number;
  mobileBreakpoint?: number; // px, default 640

  // Loading state
  isLoading?: boolean;

  // Styling
  className?: string;

  // Callbacks
  onError?: (error: string) => void;

  // UI options
  showPresetCombobox?: boolean;
}

export interface Preset {
  label: string;
  shortLabel?: string;
  value: () => DateRange;
  icon?: LucideIcon;
}

export interface CalendarWrapperProps {
  value?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  numberOfMonths?: number;
  isDayDisabled?: (day: Date) => boolean;
  locale?: Locale;
  className?: string;
  minDuration?: number;
  maxDuration?: number;
}

export interface PresetsProps {
  presets: Preset[];
  onSelect: (preset: Preset) => void;
  currentValue?: DateRange;
  className?: string;
}
