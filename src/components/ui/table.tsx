import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Renders a responsive table with horizontal scrolling and customizable styling.
 *
 * Wraps the table in a container div to enable horizontal overflow and applies default and custom class names.
 */
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

/**
 * Renders a table header section with a bottom border on each row.
 *
 * Spreads additional props onto the underlying `<thead>` element and applies a `data-slot` attribute for targeting.
 */
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />;
}

/**
 * Renders a `<tbody>` element for a table with custom styling that removes the border from the last row.
 *
 * Additional props are spread onto the `<tbody>` element.
 */
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

/**
 * Renders a styled table footer (`<tfoot>`) element with predefined classes for background, border, and font weight.
 *
 * Additional props are spread onto the `<tfoot>` element.
 */
function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  );
}

/**
 * Renders a table row with styling for hover, selection state, borders, and transitions.
 *
 * Additional props are spread onto the underlying `<tr>` element.
 */
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a styled table header cell (`<th>`) with consistent alignment, spacing, and support for embedded checkboxes.
 *
 * Additional props are spread onto the underlying `<th>` element.
 */
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a styled table cell (`<td>`) element with customizable classes and support for embedded checkboxes.
 *
 * Spreads additional props onto the underlying `<td>` element.
 */
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a styled table caption element with muted text and spacing.
 *
 * Additional props are spread onto the underlying `<caption>` element.
 */
function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
