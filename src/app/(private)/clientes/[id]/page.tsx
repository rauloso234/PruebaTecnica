import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { ClientDetail } from "@/features/clients/client-detail";
import { readClient } from "@/lib/data/crm-reader";

export const metadata: Metadata = { title: "Ficha de cliente" };

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, resource } = await readClient(id);
  return <WorkspaceShell user={user} active="clientes"><ClientDetail resource={resource} /></WorkspaceShell>;
}
