import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { DashboardView } from "@/features/dashboard/dashboard-view";
import { readDashboard } from "@/lib/data/crm-reader";

export const metadata: Metadata = { title: "Panel comercial" };

export default async function DashboardPage() {
  const { user, resource } = await readDashboard();
  return <WorkspaceShell user={user} active="dashboard"><DashboardView resource={resource} displayName={user.displayName} /></WorkspaceShell>;
}
