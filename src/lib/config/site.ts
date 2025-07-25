/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const siteConfig = {
  name: "Notso AI",
  description: "A web dashboard for visualizing chatbot conversation analytics",
  author: "Kaj Kowalski",
  license: {
    name: "AGPLv3",
    url: "https://www.gnu.org/licenses/agpl-3.0.html"
  },
  repository: {
    owner: "kjanat",
    name: "livegraphs-static",
    url: "https://github.com/kjanat/livegraphs-static",
    issuesUrl: "https://github.com/kjanat/livegraphs-static/issues"
  },
  copyright: {
    year: new Date().getFullYear(),
    holder: "Kaj Kowalski"
  }
} as const;
