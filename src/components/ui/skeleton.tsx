import { cn } from "@/lib/utils";

// Base skeleton component
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
      className={cn("bg-muted animate-pulse rounded-md", className)}
      role="status"
      aria-label={ariaLabel}
      {...props}
    />
  );
}

// Chart skeleton variant for loading charts
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

// Metrics skeleton variant for loading metric cards
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
