# Create New Composable Component

- Pros: Clean slate, better architecture, easier testing
- Cons: Need to maintain two components during transition

## 1\. Priority Implementation Order

1. 🥇 Duration Constraints (1-2 days)
    - Add min/max duration validation
    - Show helpful constraint messages
    - Minimal changes to existing code
2. 🥈 Enhanced Presets (1 day)
    - Add "Yesterday", "This Week", "This Month" presets
    - Make presets configurable via props
    - Improve mobile preset layout
3. 🥉 Internationalization (2-3 days)
    - Add locale prop and support
    - Localize all strings and labels
    - Support different date formats

## 2\. Code Organization for Maintainability

```tree
// src/components/ui/date-picker/
├── DateRangePicker.tsx          // Main component
├── DateRangePickerCalendar.tsx  // Calendar logic
├── DateRangePickerPresets.tsx   // Preset buttons
├── DateRangePickerUtils.ts      // Shared utilities
├── constants.ts                 // Configuration
└── types.ts                     // TypeScript types
```

## 3\. Integration with shadcn/ui Updates

```tsx
// Base calendar that inherits from shadcn/ui
import { Calendar } from "@/components/ui/calendar"

export const DateRangePickerCalendar = React.forwardRef<
  HTMLDivElement,
  CalendarProps & { customProp?: string }
>(({ customProp, ...props }, ref) => {
  // Only override what's necessary
  return (
    <Calendar
      {...props}
      ref={ref}
      classNames={{
        ...props.classNames,
        // Add custom classes without removing defaults
        day_selected: cn(
          props.classNames?.day_selected,
          "custom-selected-styles"
        ),
      }}
    />
  )
})
```

## 4\. Specific Feature Implementations

### Duration Constraints

```tsx
// Add to DateRangePicker component
const handleSelect = (range: DateRange | undefined) => {
  if (!range?.from || !range?.to) return

  const duration = differenceInDays(range.to, range.from) + 1

  if (minDuration && duration < minDuration) {
    setError(`Please select at least ${minDuration} days`)
    return
  }

  if (maxDuration && duration > maxDuration) {
    setError(`Please select no more than ${maxDuration} days`)
    return
  }

  setDateRange(range)
  setError(undefined)
}

// Display hint
{showDurationHint && (minDuration || maxDuration) && (
  <p className="text-xs text-muted-foreground mt-2">
    {minDuration && maxDuration
      ? `Select between ${minDuration} and ${maxDuration} days`
      : minDuration
      ? `Select at least ${minDuration} days`
      : `Select up to ${maxDuration} days`}
  </p>
)}
```

### Enhanced Presets

```tsx
// Configurable preset system
const presets = customPresets || [
  {
    label: "Today",
    shortLabel: "1D",
    value: () => {
      const today = new Date()
      return { from: startOfDay(today), to: endOfDay(today) }
    }
  },
  {
    label: "This Week",
    shortLabel: "1W",
    value: () => ({
      from: startOfWeek(new Date()),
      to: endOfWeek(new Date())
    })
  },
  // ... more presets
]

// Responsive preset display
<div className="flex flex-wrap gap-2 p-3 border-t">
  {presets.map((preset) => (
    <Button
      key={preset.label}
      variant="outline"
      size="sm"
      onClick={() => applyPreset(preset)}
      className="flex-1 min-w-[80px]"
    >
      <span className="hidden sm:inline">{preset.label}</span>
      <span className="sm:hidden">{preset.shortLabel || preset.label}</span>
    </Button>
  ))}
</div>
```

## 5\. Testing Strategy

```ts
// Test new features independently
describe('DateRangePicker Enhancements', () => {
  it('enforces minimum duration constraint', () => {
    // Test validation logic
  })

  it('displays localized calendar for different locales', () => {
    // Test i18n support
  })

  it('applies custom presets correctly', () => {
    // Test preset functionality
  })
})
```

## 6\. Performance Considerations

- Lazy load locale data: const locale = await import(date-fns/locale/${localeName})
- Memoize preset calculations
- Use React.memo for calendar components
- Debounce validation for better UX

## 7\. Migration Checklist

- Add new props with defaults to maintain backward compatibility
- Update TypeScript types
- Add unit tests for new features
- Update documentation with examples
- Test with existing usage in application
- Add feature flags if needed for gradual rollout
- Update E2E tests

!!! warning

    We don't have to maintian two components during transition.

    - We will do test-driven development (TDD) to ensure the new component works as expected.
    - We will start using the new component in the application from day 1.
    - We will write tests for the component expecting them to fail in the way we expect them to fail.
    - We will write the code to make the component pass the tests.
    - We will update the tests to expect the new component to pass.
    - We will continue to write tests for the component until it passes all tests.
    - Once the component is fully tested, we will be happy and delete the old component completely.
        - Important: switching to the new component is a day 1 thing. So no switching back and forth.

## Requirements

- Responsive:
  - Mobile: single-month calendar, see `src/components/calendar-04.tsx`
  - Desktop: two-month calendar, see `src/components/calendar-05.tsx`
- Range-selection
- Easily customizable presets (last day, last month, last week, last quarter, all data, etc.), see `src/components/calendar-19.tsx`
- Easily customizable, and turn-off-able minimum and maximum days selection, see `src/components/calendar-07.tsx` for the on-state
- Days that have no data are disabled, see `src/components/calendar-08.tsx`
- Future-proof: locale support, see `src/components/calendar-12.tsx`.
  - Don't implement, just build with expansion in mind

---
---

## Plan rewrite

Here’s the distilled brain-dump you can actually use:

---

## TL;DR Strategy

- **Build ONE new composable `DateRangePicker` and ship it immediately.** Old one goes in the trash as soon as this passes tests.
- **Implement in this order:** Duration limits → Presets overhaul → i18n scaffolding (hooks/props, not full translations yet).
- **Design for expansion, not premature features:** Locale plumbing, disabled days API, etc., but don’t overbuild.

---

## Core Requirements (What “Done” Means)

1. **Responsive UI**
   - Mobile: 1 month view.
   - Desktop: 2 month view.
2. **Range selection with min/max day constraints (toggle-able).**
3. **Configurable presets (Today, This Week, Yesterday, etc.) as a prop.**
4. **Disable days with no data (prop-driven function like `isDayDisabled(date)`.)**
5. **Locale-ready (prop for locale + date format, lazy-load locale data).**

---

## Props Sketch (make this real in `types.ts`)

```ts
export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;

  minDuration?: number; // in days
  maxDuration?: number;

  showDurationHint?: boolean;

  presets?: Preset[];
  locale?: Locale;               // date-fns Locale or your wrapper
  dateFormat?: string;           // e.g. "dd/MM/yyyy"

  isDayDisabled?: (day: Date) => boolean;

  mobileBreakpoint?: number;     // px, default 640?
  className?: string;
}

export interface Preset {
  label: string;
  shortLabel?: string;
  value: () => DateRange;
}
```

---

## File Layout (keep it stupid simple)

```tree
/src/components/ui/date-range-picker/
  DateRangePicker.tsx          // public API, state mgmt
  Calendar.tsx                 // pure calendar view (wrap shadcn)
  Presets.tsx                  // buttons list
  utils.ts                     // diffInDays, clampRange, etc.
  constants.ts
  types.ts
```

---

## Implementation Nuggets

- **Validation:** Run on select; debounce if you’re validating while dragging.
- **Error state:** Internal `error` or expose via `onError` callback? Decide now.
- **Presets:** Memoize list; responsive labels (full vs. short).
- **ClassNames merging:** Never blow away shadcn defaults—merge with `cn()`.

---

## Testing (TDD or it didn’t happen)

1. **Unit tests**

   - min/max duration logic
   - preset application
   - locale-driven formatting (snapshots? better: explicit strings)
   - disabled days cannot be selected

2. **Component tests (RTL)**

   - Mobile vs desktop layouts
   - Error messages show/hide correctly

3. **E2E (Playwright/Cypress)**

   - Real user flows: pick range, switch preset, invalid range feedback.

---

## Performance Stuff (don’t prematurely optimize, but still)

- Lazy-load locale: `await import('date-fns/locale/nl')`.
- `React.memo` Calendar & Presets.
- Pure helper fns in `utils.ts`, memoize presets with `useMemo`.

---

## Migration Plan (No Dual Maintenance, remember?)

- Feature flag **off?** Nope. We flip to new component day 1.
- Write failing tests for desired behavior.
- Implement until green.
- Replace all usages.
- Delete old crap.

---

## Open Questions to Nail Down

- Should `DateRangePicker` be controlled, uncontrolled, or both?
- Where do we show errors? Inline below calendar or toast/snackbar?
- What’s the exact breakpoint for 1 vs 2 month view (hardcode 640px or via prop)?
- Do we support keyboard nav / accessibility out of the gate? (You should.)

---

## Next Steps Checklist

- [ ] Finalize props & types
- [ ] Write initial failing tests (min/max, presets, disabled days)
- [ ] Scaffold component/files
- [ ] Implement duration logic
- [ ] Implement preset system + responsive labels
- [ ] Add locale prop & lazy-load hook
- [ ] Wire disabled days
- [ ] Docs & examples
- [ ] Kill the old component

---

Ping me if you want a quick starter code file or test templates. Otherwise, go build the damn thing.

## What do you think of all these, can we make it even simpler?

Yeah, it’s all the same damn component with a couple extra props sprinkled around. `numberOfMonths={2}` is literally your “desktop mode” switch.  Min/max lives right on the Calendar already (`min`, `max`).  Locale is just another prop you pass (`locale={es}` etc.).  Presets are just buttons calling `setDate`/`setDateRange`.&#x20;

So, yes, we can make it stupider-simple:

### 1. Single Wrapper Component

Expose one `DateRangePicker` that:

- Accepts `monthsMobile` and `monthsDesktop` (defaults: 1 / 2).
- Accepts `minDuration`, `maxDuration`, `isDayDisabled`, `presets`, `locale`, etc.
- Internally decides `numberOfMonths` once (Tailwind breakpoint or double-render trick, whichever you pick).

```tsx
type Props = {
  value?: DateRange;
  onChange?: (r: DateRange | undefined) => void;
  minDuration?: number;
  maxDuration?: number;
  isDayDisabled?: (d: Date) => boolean;
  presets?: Preset[];
  locale?: Locale;
  monthsMobile?: number;
  monthsDesktop?: number;
};

export function DateRangePicker({
  value,
  onChange,
  minDuration,
  maxDuration,
  isDayDisabled,
  presets,
  locale,
  monthsMobile = 1,
  monthsDesktop = 2,
}: Props) {
  const [range, setRange] = React.useState<DateRange | undefined>(value);

  const isDesktop = useUp("md"); // tiny hook mirroring Tailwind
  const months = isDesktop ? monthsDesktop : monthsMobile;

  const handleSelect = (r?: DateRange) => {
    if (!r?.from || !r?.to) return;
    const days = differenceInDays(r.to, r.from) + 1;
    if ((minDuration && days < minDuration) || (maxDuration && days > maxDuration)) return;
    setRange(r);
    onChange?.(r);
  };

  return (
    <div className="flex flex-col gap-2">
      <Calendar
        mode="range"
        defaultMonth={range?.from}
        selected={range}
        onSelect={handleSelect}
        numberOfMonths={months} // <- the ONLY diff between 04 & 05
        disabled={isDayDisabled ? { before: undefined, after: undefined, filter: isDayDisabled } : undefined}
        locale={locale}
        className="rounded-lg border shadow-sm"
        min={minDuration}
        max={maxDuration}
      />
      {/* Optional hint + presets */}
      {!!(minDuration || maxDuration) && (
        <p className="text-xs text-muted-foreground text-center">
          {minDuration && maxDuration
            ? `Select between ${minDuration} and ${maxDuration} days`
            : minDuration
            ? `Select at least ${minDuration} days`
            : `Select up to ${maxDuration} days`}
        </p>
      )}
      {presets && presets.length > 0 && (
        <PresetBar presets={presets} apply={(p) => handleSelect(p.value())} />
      )}
    </div>
  );
}
```

### 2. Kill the Variants

Delete `Calendar04`, `05`, `07`, `08`, `12`, `19`. They’re just storybook/demo examples. Fold their behavior into props/examples in docs.

### 3. Tailwind “thinking” = hide one render

If you really don’t want a hook, render the 1-month and 2-month versions and toggle with `hidden md:block`. That’s it. Done.

---

**So yes:** one component, a handful of props, maybe a tiny breakpoint hook or double-render. Ship it, write tests, delete the rest.

## So, what files should I create, and where do I put them?

Create this and toss the old demos:

```tree
src/
  components/
    ui/
      date-range-picker/
        DateRangePicker.tsx           // Public component (state mgmt, props, validation)
        Calendar.tsx                  // Thin wrapper around shadcn/ui Calendar
        Presets.tsx                   // Preset bar/buttons
        Hint.tsx                      // (optional) tiny component for duration text
        hooks/
          useBreakpoint.ts            // md-up? returns boolean
        utils/
          range.ts                    // diffInDays, clampRange, makeRange(from,to)
          presets.ts                  // defaultPresets(), map -> DateRange
        types.ts                      // Props, Preset, DateRange re-exports
        constants.ts                  // breakpoints, defaults
        index.ts                      // barrel export
  lib/
    date/
      locales.ts                      // lazy-load helper if you want it here
  __tests__/
    DateRangePicker.test.tsx          // unit tests
    DateRangePicker.preset.test.tsx
    DateRangePicker.i18n.test.tsx
  stories/                            // if using Storybook
    DateRangePicker.stories.tsx
```

### Minimum you actually need

If you want it ultra-lean:

```tree
src/components/ui/date-range-picker/
  DateRangePicker.tsx
  Calendar.tsx
  Presets.tsx
  hooks/useBreakpoint.ts
  utils.ts
  types.ts
  index.ts
```

That’s it. Tests & stories live wherever your repo already puts them (`__tests__`, `stories/`, `apps/docs/`, etc.).

### What goes where (quick rules)

- **DateRangePicker.tsx**: receives props, holds internal state (or not if controlled), runs duration checks, wires presets + calendar, shows hint.
- **Calendar.tsx**: just wraps `shadcn/ui` Calendar, merges classNames, forwards refs.
- **Presets.tsx**: pure UI—map over `presets` prop, call `onClick(preset.value())`.
- **useBreakpoint.ts**: mirrors Tailwind’s breakpoints in one place. If you go the “double render + hidden” route, you can skip this.
- **utils/range.ts**: `differenceInDays`, `validateDuration`, etc. Keep logic testable.
- **types.ts**: Export `DateRangePickerProps`, `Preset`, maybe re-export `DateRange` from `react-day-picker`.
- **constants.ts**: Default min/max = undefined, default monthsMobile=1, monthsDesktop=2, Tailwind breakpoints if you need them.
- **index.ts**: `export * from "./DateRangePicker"`

### Delete these

All the `calendar-04.tsx`, `05`, `07`, `08`, `12`, `19` demo files. Their behavior is now props on one component.

### If you want presets/i18n split out later

Leave the folder structure as above; it’s flexible. Future you can drop `i18n.ts` or `DisabledDaysProvider.tsx` there without chaos.

Now go make the folder, paste the files, and ship. Need starter code snippets? Yell.
