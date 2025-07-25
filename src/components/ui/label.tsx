import * as LabelPrimitive from "@radix-ui/react-label";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Renders a styled label component with support for custom class names and all standard label props.
 *
 * Combines predefined utility classes for layout, typography, and disabled states with any additional classes provided.
 *
 * @param className - Additional CSS classes to apply to the label
 * @returns The rendered label element
 */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Label };
