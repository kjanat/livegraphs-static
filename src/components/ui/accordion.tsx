"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Provides the root container for an accordion interface, wrapping Radix UI's Accordion root with custom slot identification.
 */
function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

/**
 * Renders a single item within the accordion, applying border styles and custom class names.
 *
 * Adds a `data-slot="accordion-item"` attribute for identification.
 */
function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

/**
 * Renders a styled accordion trigger button with an animated chevron icon, handling user interaction to expand or collapse the associated accordion item.
 *
 * @param className - Additional CSS classes to apply to the trigger button
 * @param children - The content to display inside the trigger
 */
function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/**
 * Displays the collapsible content area of an accordion item with animated open and close transitions.
 *
 * Children are wrapped in a padded container and the content animates based on the accordion's state.
 */
function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
