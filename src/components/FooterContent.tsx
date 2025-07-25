/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { siteConfig } from "@/lib/config/site";
import { FooterLink } from "./FooterLink";

interface FooterContentProps {
  className?: string;
  linkClassName?: string;
  compact?: boolean;
}

/**
 * Renders the footer content for the dashboard, displaying copyright,
 * license information, and links to the source code and issue tracker.
 *
 * The layout adapts based on the `compact` prop, showing either a condensed or detailed footer.
 *
 * @param className - Optional CSS class for the container element.
 * @param linkClassName - Optional CSS class for link elements in compact mode.
 * @param compact - If true, renders a simplified footer layout.
 */
export function FooterContent({
  className = "",
  linkClassName = "",
  compact = false
}: FooterContentProps) {
  if (compact) {
    return (
      <div className={className}>
        <p className="text-xs text-muted-foreground">
          © {siteConfig.copyright.year} {siteConfig.copyright.holder} - Licensed under{" "}
          <a
            href={siteConfig.license.url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName || "text-primary hover:underline"}
          >
            {siteConfig.license.name}
          </a>
        </p>
        <div className="flex gap-3 text-xs">
          <a
            href={siteConfig.repository.url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName || "text-primary hover:underline"}
          >
            View Source
          </a>
          <span className="text-muted-foreground">•</span>
          <a
            href={siteConfig.repository.issuesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName || "text-primary hover:underline"}
          >
            Report Issues
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="mb-2">
        © {siteConfig.copyright.year} {siteConfig.copyright.holder} - Licensed under{" "}
        <FooterLink href={siteConfig.license.url}>{siteConfig.license.name}</FooterLink>
      </p>
      <p>
        <FooterLink href={siteConfig.repository.url}>View Source Code</FooterLink>
        {" | "}
        <FooterLink href={siteConfig.repository.issuesUrl}>Report Issues</FooterLink>
      </p>
    </div>
  );
}
