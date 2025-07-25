import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Renders a navigation region for breadcrumb links with appropriate accessibility attributes.
 *
 * Accepts all native `<nav>` element props.
 */
function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

/**
 * Renders an ordered list for breadcrumb items with appropriate styling and accessibility attributes.
 *
 * Merges default layout, spacing, and text classes with any additional class names provided.
 */
function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a breadcrumb list item with appropriate styling and data attributes.
 *
 * Accepts all native `<li>` props and merges additional class names for layout and spacing.
 */
function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

/**
 * Renders a breadcrumb link as either an anchor element or a custom component.
 *
 * If `asChild` is true, renders the child component provided via Radix UI's `Slot`; otherwise, renders an `<a>` element. Applies styling for hover and color transitions.
 *
 * @param asChild - If true, renders a custom child component instead of an anchor element
 * @returns The rendered breadcrumb link element
 */
function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  );
}

/**
 * Renders the current page indicator in a breadcrumb trail as a non-interactive, accessible element.
 *
 * Displays the active breadcrumb item with appropriate ARIA attributes to indicate it is the current page and not a navigable link.
 */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      tabIndex={-1}
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  );
}

/**
 * Renders a decorative separator between breadcrumb items, defaulting to a right-pointing chevron icon if no children are provided.
 *
 * The separator is marked as presentational and hidden from assistive technologies.
 */
function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

/**
 * Renders a decorative ellipsis with an icon and screen-reader label for collapsed breadcrumb items.
 *
 * Displays a horizontal ellipsis icon to indicate additional hidden breadcrumb items, with a visually hidden "More" label for accessibility.
 */
function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis
};
