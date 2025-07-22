# CI/CD Setup Documentation

This repository is configured with comprehensive GitHub Actions workflows and pre-commit hooks for maintaining code quality and automating deployments.

## GitHub Actions Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:** Push to master/develop, Pull requests, Manual dispatch

**Jobs:**

- **Lint:** Runs ESLint, Biome checks, and format validation
- **Test:** Matrix testing on Node.js 20.x and 22.x with coverage reporting
- **Build:** Validates production build
- **Type Check:** TypeScript type validation
- **Bundle Analysis:** Analyzes bundle size on pull requests

### 2. Security Workflow (`.github/workflows/security.yml`)

**Triggers:** Push to master/develop, Pull requests, Weekly schedule, Manual dispatch

**Jobs:**

- **Dependency Audit:** Checks for vulnerable dependencies
- **Dependency Review:** Reviews dependency changes in PRs
- **CodeQL Analysis:** Static security analysis for JavaScript/TypeScript
- **License Check:** Validates dependency licenses
- **Secrets Scan:** Scans for exposed secrets with Trivy

### 3. Code Quality Workflow (`.github/workflows/code-quality.yml`)

**Triggers:** Pull requests, Manual dispatch

**Jobs:**

- **SonarCloud Analysis:** Code quality metrics and coverage
- **Lighthouse CI:** Performance, accessibility, and SEO audits
- **Bundle Size Check:** Monitors bundle size changes
- **Code Complexity:** Analyzes code complexity metrics
- **Unused Exports:** Detects unused code exports

### 4. Deploy Workflow (`.github/workflows/deploy.yml`)

**Triggers:** Push to master, Manual dispatch

**Jobs:**

- **Build:** Creates static export with GitHub Pages base path
- **Deploy:** Deploys to GitHub Pages

### 5. Release Workflow (`.github/workflows/release.yml`)

**Triggers:** Version tags (v*), Manual dispatch with version input

**Jobs:**

- **Build and Release:** Creates GitHub releases with archives
- **Docker:** Builds and pushes multi-platform Docker images
- **NPM Publish:** (Disabled by default) Publishes to npm registry

## Pre-commit Hooks

### Setup

Pre-commit hooks are managed by Husky and lint-staged:

```bash
pnpm install  # Installs dependencies and sets up Husky
```

### Hooks

1. **pre-commit:** Runs lint-staged on staged files
   - Biome check and format for JS/TS files
   - Package.json sorting

2. **commit-msg:** Validates conventional commit format
   - Required format: `type(scope): subject`
   - Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

## Configuration Files

### Linting & Formatting

- **Biome:** `biome.jsonc` - Code formatting and linting
- **ESLint:** `eslint.config.mjs` - JavaScript/TypeScript linting
- **lint-staged:** In `package.json` - Pre-commit file processing

### Testing & Quality

- **Vitest:** `vitest.config.ts` - Test runner configuration
- **Lighthouse:** `.lighthouserc.mjs` - Performance audit thresholds
- **Size Limit:** `.size-limit.json` - Bundle size constraints

### Deployment

- **Next.js:** `next.config.ts` - Static export and GitHub Pages support
- **Docker:** `Dockerfile` - Multi-stage build for containerization

## Required Secrets

For full functionality, configure these GitHub repository secrets:

- `CODECOV_TOKEN` - For coverage reporting (optional)
- `SONAR_TOKEN` - For SonarCloud analysis (optional)
- `NPM_TOKEN` - For npm publishing (if enabled)

## GitHub Pages Setup

1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Workflows will automatically deploy on push to master

## Local Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Run linting
pnpm lint:next
pnpm lint:biome

# Format code
pnpm format

# Build for production
pnpm build
```

## Maintenance

- Review and update dependencies monthly
- Monitor security alerts from Dependabot
- Check workflow run times and optimize if needed
- Update Node.js versions in workflows as new LTS releases arrive
