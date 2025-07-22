# Test Plan: Unit Tests vs E2E Tests

## Current Test Status

### ✅ Passing Unit Tests

- `src/__tests__/lib/dataProcessor.test.ts` - Data processing logic
- `src/__tests__/lib/validation/schema.test.ts` - Schema validation
- `src/lib/utils/__tests__/trendCalculator.test.ts` - Trend calculations
- `src/__tests__/lib/database.test.ts` - Database utilities
- Component tests (charts, UI components)

### ⏭️ Skipped Tests (Better for E2E)

- `src/__tests__/hooks/useDatabase.test.ts` - Requires real browser APIs:
  - localStorage persistence
  - WebAssembly loading (sql.js)
  - Script injection
  - Database initialization

## Test Strategy

### Unit Tests (Vitest)

Keep for:

- Pure functions (dataProcessor, validation, utils)
- React component rendering
- Business logic
- Data transformations

### E2E Tests (Future Playwright)

Use for:

- Database initialization and persistence
- File upload flow
- Data visualization
- Export functionality
- Browser API interactions (localStorage, WebAssembly)
- Full user workflows

## Notes

- Unit tests should mock external dependencies
- E2E tests will test the actual integration
- This approach ensures faster unit tests and comprehensive integration coverage
