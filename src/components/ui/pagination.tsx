import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import type * as React from "react";
import { type Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Renders a navigation container for pagination controls with customizable styling and props.
 *
 * Accepts all standard `<nav>` element properties.
 */
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

/**
 * Renders a flex container for pagination items within a pagination UI.
 *
 * Accepts all standard `<ul>` element props and merges custom class names.
 */
function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

/**
 * Renders a list item for use within pagination controls.
 *
 * Forwards all standard `<li>` element props and adds a data attribute for identification.
 */
function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

/**
 * Renders a pagination link styled as a button, supporting active state and size variants.
 *
 * Sets appropriate ARIA attributes for accessibility and applies styling based on the active state.
 *
 * @param isActive - Whether the link represents the current page
 * @param size - The size variant of the button (defaults to "icon")
 */
function PaginationLink({ className, isActive, size = "icon", ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size
        }),
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a pagination control for navigating to the previous page, including a left-chevron icon and a "Previous" label.
 *
 * Inherits all props from `PaginationLink`. The label text is visually hidden on small screens.
 */
function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

/**
 * Renders a pagination control for navigating to the next page.
 *
 * Displays a "Next" label (visible on larger screens) and a right-chevron icon. Inherits all props from `PaginationLink`.
 */
function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

/**
 * Renders a non-interactive ellipsis indicator for pagination, signaling the presence of additional pages.
 *
 * Includes an icon and screen-reader-only text for accessibility.
 */
function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis
};
