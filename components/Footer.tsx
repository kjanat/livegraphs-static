/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export function FooterLink({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:text-primary/80 underline transition-colors"
      {...props}
    >
      {children}
    </a>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border bg-muted py-6 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        <p className="mb-2">
          © {year} Kaj Kowalski - Licensed under{" "}
          <FooterLink href="https://www.gnu.org/licenses/agpl-3.0.html">AGPLv3</FooterLink>
        </p>
        <p>
          <FooterLink href="https://github.com/kjanat/livegraphs-static">
            View Source Code
          </FooterLink>
          {" | "}
          <FooterLink href="https://github.com/kjanat/livegraphs-static/issues">
            Report Issues
          </FooterLink>
        </p>
      </div>
    </footer>
  );
}
