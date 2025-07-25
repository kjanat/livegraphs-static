/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { siteConfig } from "@/lib/config/site";
import { FooterLink } from "./Footer";

interface FooterContentProps {
  className?: string;
  linkClassName?: string;
  compact?: boolean;
}

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
