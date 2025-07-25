"use client";

import * as SeparatorPrimitive from "@radix-ui/react-separator";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Renders a customizable horizontal or vertical separator line.
 *
 * @param className - Additional CSS classes to apply to the separator
 * @param orientation - The orientation of the separator, either "horizontal" or "vertical" (defaults to "horizontal")
 * @param decorative - Indicates if the separator is decorative and should be hidden from assistive technologies (defaults to true)
 * @returns A styled separator element for visually dividing content
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
