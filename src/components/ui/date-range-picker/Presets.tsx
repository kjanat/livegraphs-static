import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsDesktop } from "./hooks/useBreakpoint";
import type { PresetsProps } from "./types";

/**
 * Renders a set of selectable preset buttons for date range selection.
 *
 * Displays each preset as a button, highlighting the currently selected preset and adapting label display based on screen size. Invokes the provided callback when a preset is selected.
 *
 * @param presets - Array of preset options to display
 * @param onSelect - Callback invoked with the selected preset when a button is clicked
 * @param currentValue - The currently selected date range, used to determine the active preset
 * @param className - Optional additional CSS classes for the container
 * @returns A React element containing the preset buttons
 */
export function Presets({ presets, onSelect, currentValue, className }: PresetsProps) {
  const isDesktop = useIsDesktop();

  const isPresetActive = (preset: PresetsProps["presets"][0]) => {
    const range = preset.value();
    return (
      currentValue?.from?.toDateString() === range.from?.toDateString() &&
      currentValue?.to?.toDateString() === range.to?.toDateString()
    );
  };

  return (
    <div className={cn("flex flex-wrap gap-2 p-3 border-t", className)}>
      {presets.map((preset) => {
        const isActive = isPresetActive(preset);
        const Icon = preset.icon;

        return (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            onClick={() => onSelect(preset)}
            className={cn(
              "flex-1 min-w-[80px] transition-all",
              isActive && "ring-2 ring-primary ring-offset-2"
            )}
          >
            {Icon && <Icon className="w-4 h-4 mr-2" />}
            <span className={cn(!isDesktop && preset.shortLabel && "sm:hidden")}>
              {!isDesktop && preset.shortLabel ? preset.shortLabel : preset.label}
            </span>
            {!isDesktop && preset.shortLabel && (
              <span className="hidden sm:inline">{preset.label}</span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
