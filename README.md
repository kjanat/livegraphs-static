# LiveGraphs Static

**A privacy-first chatbot analytics dashboard that processes conversation data entirely in your browser.**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Next.js](<https://img.shields.io/badge/dynamic/regex?url=https%3A%2F%2Fraw.githubusercontent.com%2Fkjanat%2Flivegraphs-static%2Fmaster%2Fpackage.json&search=%22next%22%5Cs*%3A%5Cs*%22%5C%5E(%3F%3Cversion%3E%5Cd%2B%5C.%5Cd*).*%22&replace=%24%3Cversion%3E&logo=nextdotjs&label=Nextjs&color=%23000000>)](https://nextjs.org/)
[![TypeScript](<https://img.shields.io/badge/dynamic/regex?url=https%3A%2F%2Fraw.githubusercontent.com%2Fkjanat%2Flivegraphs-static%2Fmaster%2Fpackage.json&search=%22typescript%22%5Cs*%3A%5Cs*%22%5C%5E(%3F%3Cversion%3E%5Cd%2B%5C.%5Cd*).*%22&replace=%24%3Cversion%3E&logo=typescript&label=TypeScript&color=%233178C6>)](https://www.typescriptlang.org/)

## Overview

LiveGraphs Static transforms chatbot conversation logs into actionable insights through interactive visualizations. Built with privacy by design, all data processing happens locally in your browser—no data ever leaves your device.

### Key Features

- **🔐 Privacy-First**: Client-side processing with automatic IP anonymization (GDPR/CCPA compliant)
- **📊 Comprehensive Analytics**: 15+ chart types covering sentiment, performance, costs, and geographic trends
- **⚡ Real-Time Processing**: Instant metric calculations using in-browser SQLite
- **📱 Responsive Design**: Works seamlessly across desktop and mobile devices
- **🌙 Theme Support**: Built-in dark/light mode toggle
- **♿ Accessible**: Full keyboard navigation and screen reader support

## Quick Start

### Prerequisites

- **Node.js** 24+ (22 also supported)
- **pnpm** 10+ (recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/kjanat/livegraphs-static.git
cd livegraphs-static

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Data Format

Upload JSON files with the following structure:

```json
{
  "sessions": [
    {
      "session_id": "unique-id",
      "start_time": "2024-01-01T10:00:00Z",
      "end_time": "2024-01-01T10:15:00Z",
      "questions": "How can I help you today?",
      "category": "customer_support",
      "sentiment": "positive",
      "escalated": 0,
      "forwarded_hr": 0,
      "avg_response_time": 2.5,
      "tokens_eur": 0.003,
      "rating": 4,
      "ip_address": "192.168.1.1"
    }
  ]
}
```

## Analytics Dashboard

### Available Visualizations

| Chart Type                  | Purpose                                     | Data Source                      |
| --------------------------- | ------------------------------------------- | -------------------------------- |
| **Sentiment Analysis**      | Track conversation sentiment distribution   | `sentiment` field                |
| **Performance Metrics**     | Monitor response times and escalation rates | `avg_response_time`, `escalated` |
| **Cost Analysis**           | Daily spending and category breakdown       | `tokens_eur`, `category`         |
| **Geographic Distribution** | User locations and language preferences     | `ip_address` (anonymized)        |
| **Usage Heatmaps**          | Hourly and daily activity patterns          | `start_time`                     |
| **Rating Trends**           | Customer satisfaction over time             | `rating`                         |

### Interactive Features

- **Date Range Filtering**: Focus on specific time periods
- **Progressive Disclosure**: Charts appear based on available data
- **Export Capabilities**: Download filtered data as CSV
- **Sample Data**: Built-in generator for testing

## Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm dev:turbo        # Dev server with Turbopack (experimental)

# Production
pnpm build            # Build static export
pnpm start            # Serve built files locally

# Code Quality
pnpm validate         # Run all checks (lint, format, type-check)
pnpm lint:strict      # Biome code quality checks
pnpm format           # Format code with Biome
pnpm type-check       # TypeScript validation

# Testing
pnpm test             # Run tests once
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run with coverage report
pnpm test:ui          # Open Vitest UI
```

### Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript 5.8+ (strict mode)
- **Database**: SQL.js (in-browser SQLite)
- **Charts**: Chart.js, Nivo, React-gauge-component
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest + React Testing Library
- **Code Quality**: Biome (formatting/linting)

### Project Structure

```plaintext
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main dashboard component
│   └── layout.tsx         # Root layout with themes
├── components/
│   ├── charts/            # 15+ chart components
│   ├── ui/               # Reusable UI components
│   └── icons/            # Icon components
├── lib/
│   ├── db/               # Database schema & management
│   ├── validation/       # Zod schemas
│   ├── dataProcessor.ts  # Analytics calculations
│   └── types/            # TypeScript definitions
└── hooks/
    └── useDatabase.ts    # Database React integration
```

## Privacy & Security

### Data Protection

- **Local Processing**: All analytics happen in your browser
- **IP Anonymization**: Automatic anonymization during import
- **No Data Persistence**: Data exists only during your session
- **No External Services**: Zero third-party data transmission

### Compliance

- **GDPR Compliant**: Built-in privacy protections
- **CCPA Compliant**: No personal data collection
- **Security Headers**: Comprehensive CSP and security configuration

## Deployment

### Static Hosting

```bash
# Build for production
pnpm build

# Deploy the /out directory to:
# - Vercel, Netlify, GitHub Pages
# - AWS S3, Google Cloud Storage
# - Any static file hosting service
```

### Docker

```dockerfile
# Multi-stage build included
docker build -t livegraphs-static .
docker run -p 3000:80 livegraphs-static
```

## Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm validate` to check code quality
5. Submit a pull request

## License

This project is licensed under the [AGPL-3.0-or-later](LICENSE) license.

## Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/kjanat/livegraphs-static/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/kjanat/livegraphs-static/discussions)
- 📧 **Contact**: [dev@kajkowalski.nl](mailto:dev@kajkowalski.nl)

---

**LiveGraphs Static** - Transforming chatbot data into actionable insights, privately and securely.
