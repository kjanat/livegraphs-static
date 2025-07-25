import { cn } from "@/lib/utils";

/**
 * Renders a generic skeleton placeholder with a pulsing animation for loading states.
 *
 * Accepts standard `div` props and allows customization of class names and ARIA label for accessibility.
 */
function Skeleton({
  className,
  "aria-label": ariaLabel = "Loading",
  ...props
}: React.ComponentProps<"div"> & {
  "aria-label"?: string;
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      role="status"
      aria-label={ariaLabel}
      {...props}
    />
  );
}

/**
 * Renders a skeleton placeholder simulating a loading chart.
 *
 * Displays a styled card with animated skeleton bars and a faded chart area to indicate chart content is loading. The height and ARIA label can be customized.
 *
 * @param className - Optional additional class names for the container
 * @param height - Height of the skeleton chart area in pixels or CSS units (default: 300)
 * @param aria-label - ARIA label for accessibility (default: "Loading chart")
 */
function ChartSkeleton({
  className = "",
  height = 300,
  "aria-label": ariaLabel = "Loading chart"
}: {
  className?: string;
  height?: number | string;
  "aria-label"?: string;
}) {
  return (
    <output
      className={cn(
        "bg-card rounded-lg border shadow-sm p-6 animate-in fade-in duration-500",
        className
      )}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
      aria-label={ariaLabel}
    >
      <Skeleton className="h-4 w-3/4 mb-4" />
      <Skeleton className="h-3 w-1/2 mb-6" />
      <div className="relative h-full">
        <Skeleton className="absolute inset-0 opacity-50" />
      </div>
    </output>
  );
}

/**
 * Renders a skeleton placeholder for a grid of metric cards during loading states.
 *
 * Displays a configurable number of metric skeleton blocks arranged in a responsive grid, with ARIA attributes for accessibility.
 *
 * @param skeletonCount - The number of metric skeleton blocks to display
 */
function MetricsSkeleton({
  skeletonCount = 8,
  className = "",
  "aria-live": ariaLive = "polite",
  "aria-label": ariaLabel = "Loading metrics"
}: {
  skeletonCount?: number;
  className?: string;
  "aria-live"?: "polite" | "assertive" | "off";
  "aria-label"?: string;
}) {
  const skeletons = Array.from({ length: skeletonCount }, (_, index) => index);

  return (
    <output
      className={cn(
        "bg-card rounded-lg shadow-md p-6 animate-in fade-in duration-500 mb-8",
        className
      )}
      aria-busy="true"
      aria-live={ariaLive}
      aria-label={ariaLabel}
    >
      <Skeleton className="h-8 w-32 mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {skeletons.map((index) => (
          <div key={`metric-skeleton-${index}`} className="bg-secondary p-4 rounded">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </output>
  );
}

export { Skeleton, ChartSkeleton, MetricsSkeleton };
