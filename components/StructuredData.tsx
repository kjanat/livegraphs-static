/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Script from "next/script";
import { generateBreadcrumbData, generateStructuredData } from "@/lib/constants/structuredData";

interface StructuredDataProps {
  currentPage?: string;
}

/**
 * Component to inject structured data (JSON-LD) for SEO
 * This is a Server Component that adds rich snippets
 */
export function StructuredData({ currentPage = "Dashboard" }: StructuredDataProps) {
  const structuredData = generateStructuredData();
  const breadcrumbData = generateBreadcrumbData(currentPage);

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe and generated from trusted source
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <Script
        id="breadcrumb-data"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe and generated from trusted source
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData)
        }}
      />
    </>
  );
}
