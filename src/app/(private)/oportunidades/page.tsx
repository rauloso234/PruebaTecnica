import type { Metadata } from "next";
import { createOpportunity, updateOpportunity, deleteOpportunity } from "@/features/opportunities/actions";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { OpportunitiesView } from "@/features/opportunities/opportunities-view";
import { readOpportunities } from "@/lib/data/crm-reader";

export const metadata: Metadata = { title: "Oportunidades" };

export default async function OpportunitiesPage() {
  const { user, resource } = await readOpportunities();
  return <WorkspaceShell user={user} active="oportunidades"><OpportunitiesView resource={resource} actions={{ createOpportunity, updateOpportunity, deleteOpportunity }} /></WorkspaceShell>;
}
