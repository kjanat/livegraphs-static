"use client";

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type * as React from "react";
import { useRef, useState } from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames();
  const isMultipleMonths = props.numberOfMonths && props.numberOfMonths > 1;

  // Swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      // Find and click the appropriate navigation button
      if (calendarRef.current) {
        const navButton = calendarRef.current.querySelector(
          isLeftSwipe ? 'button[name="next-month"]' : 'button[name="previous-month"]'
        ) as HTMLButtonElement;

        if (navButton) {
          navButton.click();
        }
      }
    }
  };

  return (
    <div
      ref={calendarRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        captionLayout={captionLayout}
        classNames={{
          root: cn(defaultClassNames.root, "relative"),
          months: cn(
            "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            defaultClassNames.months
          ),
          month: cn("space-y-4", defaultClassNames.month),
          month_caption: cn(
            "flex justify-center pt-1 relative items-center",
            defaultClassNames.month_caption
          ),
          caption_label: cn("text-sm font-medium", defaultClassNames.caption_label),
          nav: cn(
            isMultipleMonths
              ? "absolute top-1 left-0 right-0 flex justify-between px-4 z-10 pointer-events-none"
              : "flex items-center",
            defaultClassNames.nav
          ),
          button_previous: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            isMultipleMonths && "pointer-events-auto",
            defaultClassNames.button_previous
          ),
          button_next: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            isMultipleMonths && "pointer-events-auto",
            defaultClassNames.button_next
          ),
          weekdays: cn("grid grid-cols-7", defaultClassNames.weekdays),
          weekday: cn(
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            defaultClassNames.weekday
          ),
          week: cn("grid grid-cols-7 mt-2", defaultClassNames.week),
          day: cn("h-9 w-9 text-center text-sm p-0 relative", defaultClassNames.day),
          day_button: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          selected: cn(
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            defaultClassNames.selected
          ),
          today: cn("bg-accent text-accent-foreground", defaultClassNames.today),
          outside: cn(
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
            defaultClassNames.outside
          ),
          disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
          range_start: cn("range-start", defaultClassNames.range_start),
          range_end: cn("range-end", defaultClassNames.range_end),
          range_middle: cn(
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
            defaultClassNames.range_middle
          ),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames
        }}
        components={{
          DayButton: ({ className, modifiers, ...props }) => {
            const isRangeMiddle = modifiers.range_middle;
            const isRangeStart = modifiers.range_start;
            const isRangeEnd = modifiers.range_end;
            const isOutside = modifiers.outside;

            return (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 font-normal transition-all rounded-md",
                  "hover:bg-accent hover:text-accent-foreground",
                  // Selected dates (start/end) - keep square shape on hover
                  modifiers.selected &&
                    !isRangeMiddle &&
                    "bg-primary text-primary-foreground rounded-none hover:bg-primary hover:text-primary-foreground hover:rounded-none",
                  // Range start - keep left side square
                  isRangeStart &&
                    "bg-primary text-primary-foreground rounded-r-none rounded-l-none hover:rounded-r-none hover:rounded-l-none",
                  // Range end - keep right side square
                  isRangeEnd &&
                    "bg-primary text-primary-foreground rounded-l-none rounded-r-none hover:rounded-l-none hover:rounded-r-none",
                  // Range middle
                  isRangeMiddle && !isOutside && "bg-accent rounded-none hover:rounded-none",
                  // Today
                  modifiers.today &&
                    !modifiers.selected &&
                    "bg-accent text-accent-foreground font-semibold",
                  // Disabled
                  modifiers.disabled &&
                    "text-muted-foreground opacity-50 cursor-not-allowed hover:bg-transparent",
                  // Outside days - override all other styles
                  isOutside &&
                    "text-muted-foreground opacity-50 !bg-transparent hover:!bg-transparent",
                  className
                )}
                disabled={modifiers.disabled}
                data-range-start={isRangeStart ? "true" : undefined}
                data-range-end={isRangeEnd ? "true" : undefined}
                data-range-middle={isRangeMiddle && !isOutside ? "true" : undefined}
                data-outside={isOutside ? "true" : undefined}
                name="day"
                {...props}
              />
            );
          },
          Chevron: ({ className, orientation, ...props }) => {
            const Icon =
              orientation === "left"
                ? ChevronLeftIcon
                : orientation === "right"
                  ? ChevronRightIcon
                  : ChevronDownIcon;
            return <Icon className={cn("h-4 w-4", className)} {...props} />;
          },
          ...props.components
        }}
        {...props}
      />
    </div>
  );
}

export { Calendar };
