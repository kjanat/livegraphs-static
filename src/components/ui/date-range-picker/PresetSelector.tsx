"use client";

import * as React from "react";
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
  className?: string;
}

export function PresetSelector({ presets, onSelect, className }: PresetSelectorProps) {
  const handleValueChange = (value: string) => {
    const selectedPreset = presets.find((p) => p.label === value);
    if (selectedPreset) {
      onSelect(selectedPreset);
    }
  };

  return (
    <Select onValueChange={handleValueChange}>
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
