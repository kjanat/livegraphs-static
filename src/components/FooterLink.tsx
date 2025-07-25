/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Renders a styled anchor element that opens the link in a new tab with secure attributes.
 *
 * Applies predefined styles and spreads additional anchor attributes onto the element. The link content is provided via the `children` prop.
 *
 * @param href - The URL to navigate to when the link is clicked
 * @param children - The content to display inside the link
 * @returns The rendered anchor element
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
