/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { ClientDashboard } from "@/components/ClientDashboard";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

/**
 * Home page - Server Component
 * Renders static layout and delegates interactive content to Client Components
 */
export default function Home() {
  return (
    <PageContainer>
      <PageHeader />
      <ClientDashboard />
    </PageContainer>
  );
}
