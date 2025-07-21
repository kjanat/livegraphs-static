# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LiveGraphs Static is a Next.js-based web application for visualizing chatbot conversation analytics. It processes JSON data files containing chatbot session logs and generates interactive visualizations using Chart.js and Nivo charts. The application runs entirely in the browser using SQL.js for data storage.

## Tech Stack

- **Framework**: Next.js ≥ 15 with React ≥ 19
- **Language**: TypeScript ≥ 5.8
- **Database**: SQL.js (in-browser SQLite)
- **Charts**: Chart.js ≥ 4, React-ChartJS-2, Nivo
- **Styling**: Tailwind CSS v4
- **Package Manager**: pnpm v10
- **Node Version**: 24 (22 also supported)
- **Testing**: Vitest with React Testing Library
- **Code Quality**: Biome (formatter/linter), ESLint, Husky, lint-staged

## Key Commands

### Development

```bash
pnpm dev          # Run Next.js dev server (http://localhost:3000) The user usually has it running in the background
pnpm dev:turbo    # Run with Turbopack (experimental faster bundler, kinda broken)
```

### Build & Production

```bash
pnpm build        # Build for production (creates .next and out directories)
pnpm start        # Serve static files using 'serve' package
```

### Code Quality

```bash
pnpm lint                     # Run all (Next's eslint + biome) linting
pnpm lint:next                # Run Next.js linting (eslint)
pnpm lint:biome         # Run Biome checks
pnpm lint:biome --write # Run Biome checks and fix the fixable issues
pnpm format              # Format code with Biome
pnpm type-check          # TypeScript type checking
pnpm validate            # Run all checks (lint, format:check, type-check)
```

### Testing

```bash
pnpm test          # Run tests once
pnpm test:watch    # Run tests in watch mode
pnpm test:coverage # Run tests with coverage
pnpm test:ui       # Open Vitest UI
```

### Single Test Execution

```bash
pnpm test path/to/test.test.ts    # Run specific test file
pnpm test -t "test name"          # Run tests matching pattern
```

## Architecture

### Core Application Flow

1. **Entry Point**: `app/page.tsx`
   - Client-side React component
   - Handles JSON file uploads
   - Manages application state (database, metrics, charts)
   - Renders dashboard with multiple chart types

2. **Data Processing Pipeline**:
   - `lib/validation/schema.ts` - Zod schemas validate uploaded JSON
   - `lib/db/database.ts` - SQL.js database initialization and management
   - `lib/dataProcessor.ts` - Calculates metrics and prepares chart data
   - `components/charts/*` - Various chart components render visualizations

3. **Database Layer**:
   - Uses SQL.js for client-side SQLite
   - Schema defined in `lib/db/schema.ts` (imported as module)
   - `useDatabase` hook provides React integration
   - All processing happens in the browser

### Key Components

- **Charts** (`/components/charts/`):
  - `AnalyticsChart` - Bar/Doughnut for general metrics
  - `BubbleChart` - Cost vs session analysis
  - `GaugeChart` - Average rating display
  - `HistogramChart` - Distribution visualizations
  - `InteractiveHeatmap` - Hourly usage patterns
  - `MultiLineChart` - Time series data

- **Data Flow**:
  1. User uploads JSON with session data
  2. Data validated against Zod schemas
  3. Loaded into SQL.js database
  4. User selects date range filter
  5. Metrics calculated on-demand
  6. Charts rendered with processed data
  7. Results exportable as CSV

### Type System

- Comprehensive TypeScript types in `lib/types.ts`
- Zod schemas provide runtime validation
- Chart.js types extended for custom configurations

## JSON Data Format

Expected structure (validated by Zod):

```typescript
{
  sessions: Array<{
    session_id: string
    start_time: string  // ISO format
    end_time: string    // ISO format
    questions: string
    category: string
    sentiment: string
    escalated: 0 | 1
    forwarded_hr: 0 | 1
    avg_response_time: number
    tokens_eur: number
    rating?: number
    ip_address?: string  // ⚠️ PII - See privacy notice below
  }>
}
```

### ⚠️ Privacy & Compliance Notice for `ip_address` Field

The `ip_address` field contains **Personally Identifiable Information (PII)** subject to GDPR, CCPA, and other privacy regulations:

- **Collection**: Should be optional and require explicit user consent
- **Anonymization**: Consider storing only a hash or partial IP (e.g., `192.168.x.x`)
- **Processing**: Anonymization should occur BEFORE data enters the application:
  - Best: Anonymize in the data source before export
  - Alternative: Add anonymization in `lib/validation/schema.ts` during import
- **Retention**: Define and document retention policy (e.g., 90 days)
- **Access Control**: Ensure proper access controls for any stored IP data

**Recommendation**: Unless IP addresses are essential for analytics, consider removing this field entirely or replacing with anonymized geographic data (country/region only).

## Testing Strategy

- Component tests use React Testing Library
- Database operations tested with in-memory SQL.js
- Chart components tested for data rendering
- Run specific test: `pnpm test components/charts/AnalyticsChart.test.tsx`

## CI/CD Pipeline

GitHub Actions workflows:

- `ci.yml` - Main pipeline (lint, test, build, type-check)
- `code-quality.yml` - Biome and ESLint checks
- `security.yml` - Security scanning
- Pre-commit hooks via Husky run formatting and linting

## Deployment

- Static export via `pnpm build` creates `/out` directory
- Docker support with multi-stage build (Node.js build → nginx serve)
- Can be deployed to any static hosting (Vercel, Netlify, S3, etc.)

## Common Development Tasks

### Adding a New Chart Type

1. Create component in `components/charts/`
2. Add data preparation logic in `lib/dataProcessor.ts`
3. Import and render in `app/page.tsx`
4. Add TypeScript types to `lib/types.ts`
5. Write tests in `components/charts/__tests__/`

### Modifying Data Schema

1. Update Zod schema in `lib/validation/schema.ts`
2. Update SQL schema in `lib/db/schema.ts`
3. Update TypeScript types in `lib/types.ts`
4. Update data processing in `lib/dataProcessor.ts`

### Performance Considerations

- All data processing happens client-side
- Large datasets may impact browser performance
- Charts use React.memo for optimization
- SQL.js database is recreated on each upload

## Important Patterns

### State Management

- React hooks for local state
- No external state management library
- Database state managed via `useDatabase` hook

### Error Handling

- File upload errors shown via toast/alert
- Data validation errors from Zod schemas
- Chart rendering errors caught with error boundaries

### Code Style

- Biome for consistent formatting
- Functional components with hooks
- TypeScript strict mode enabled
- Tailwind CSS for styling

### Branding

- Logo component at `/components/Logo.tsx` - reusable SVG with theme support
- Logo as SVG in `/public/notso-{black,white}.svg`
- Favicons in `/public/favicon{,16,32,64,128,256}{,x}{,16,32,64,128,256}.{svg,png}` for static export compatibility
