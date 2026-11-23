import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { PipelineView } from "@/features/pipeline/pipeline-view";
import { readOpportunities } from "@/lib/data/crm-reader";

export const metadata: Metadata = { title: "Pipeline comercial" };

export default async function PipelinePage() {
  const { user, resource } = await readOpportunities();
  return <WorkspaceShell user={user} active="pipeline"><PipelineView resource={resource} /></WorkspaceShell>;
}
