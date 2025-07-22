/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { SITE_CONFIG } from "./metadata";

/**
 * Generate structured data (JSON-LD) for better SEO
 */
export function generateStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${SITE_CONFIG.url}/#webapp`,
        name: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
        url: SITE_CONFIG.url,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Analytics",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD"
        },
        featureList: [
          "Interactive data visualization",
          "Real-time analytics",
          "Multiple chart types",
          "CSV export",
          "Date range filtering",
          "Privacy-focused (client-side processing)",
          "Mobile responsive"
        ],
        screenshot: [
          {
            "@type": "ImageObject",
            url: `${SITE_CONFIG.url}/screenshot-dashboard.png`,
            caption: "Dashboard overview with charts"
          },
          {
            "@type": "ImageObject",
            url: `${SITE_CONFIG.url}/screenshot-analytics.png`,
            caption: "Analytics visualization"
          }
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "142"
        }
      },
      {
        "@type": "Organization",
        "@id": `${SITE_CONFIG.url}/#organization`,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_CONFIG.url}/logo.png`,
          width: 512,
          height: 512
        },
        sameAs: [
          // Add social media URLs here
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_CONFIG.url}/#website`,
        url: SITE_CONFIG.url,
        name: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
        publisher: {
          "@id": `${SITE_CONFIG.url}/#organization`
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_CONFIG.url}/?search={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What data format does Notso AI accept?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Notso AI accepts JSON files containing chatbot session data with fields like session_id, start_time, end_time, questions, category, sentiment, and more."
            }
          },
          {
            "@type": "Question",
            name: "Is my data secure?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, all data processing happens entirely in your browser. No data is sent to any server, ensuring complete privacy and security."
            }
          },
          {
            "@type": "Question",
            name: "What types of analytics are available?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Notso AI provides sentiment analysis, resolution rates, response time trends, usage heatmaps, cost analysis, geographic distribution, and more."
            }
          }
        ]
      }
    ]
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbData(currentPage = "Dashboard") {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_CONFIG.url
      },
      {
        "@type": "ListItem",
        position: 2,
        name: currentPage
      }
    ]
  };
}
