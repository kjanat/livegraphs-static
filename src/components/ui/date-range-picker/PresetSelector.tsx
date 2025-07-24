"use client";

import type { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { Preset } from "./types";

interface PresetSelectorProps {
  presets: Preset[];
  onSelect: (preset: Preset) => void;
  currentValue?: DateRange;
  className?: string;
}

export function PresetSelector({
  presets,
  onSelect,
  currentValue,
  className
}: PresetSelectorProps) {
  const handleValueChange = (value: string) => {
    const selectedPreset = presets.find((p) => p.label === value);
    if (selectedPreset) {
      onSelect(selectedPreset);
    }
  };

  const selectedPreset = presets.find((preset) => {
    const range = preset.value();
    return (
      currentValue &&
      range.from?.getTime() === currentValue.from?.getTime() &&
      range.to?.getTime() === currentValue.to?.getTime()
    );
  });

  return (
    <Select onValueChange={handleValueChange} defaultValue={selectedPreset?.label}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select time range..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {presets.map((preset) => (
            <SelectItem key={preset.label} value={preset.label}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
