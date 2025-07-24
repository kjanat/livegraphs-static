"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Preset } from "./types";

interface PresetComboboxProps {
  presets: Preset[];
  onSelect: (preset: Preset) => void;
  className?: string;
}

export function PresetCombobox({ presets, onSelect, className }: PresetComboboxProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value
            ? presets.find((preset) => preset.label.toLowerCase() === value)?.label
            : "Select time range..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search presets..." className="h-9" />
          <CommandList>
            <CommandEmpty>No preset found.</CommandEmpty>
            <CommandGroup>
              {presets.map((preset) => (
                <CommandItem
                  key={preset.label}
                  value={preset.label.toLowerCase()}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    const selectedPreset = presets.find(
                      (p) => p.label.toLowerCase() === currentValue
                    );
                    if (selectedPreset) {
                      onSelect(selectedPreset);
                    }
                  }}
                >
                  {preset.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === preset.label.toLowerCase() ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
