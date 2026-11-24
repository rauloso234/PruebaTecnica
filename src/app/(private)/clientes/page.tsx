import type { Metadata } from "next";
import { createClient, updateClient, deleteClient } from "@/features/clients/actions";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { ClientsView } from "@/features/clients/clients-view";
import { readClients } from "@/lib/data/crm-reader";

export const metadata: Metadata = { title: "Clientes" };

export default async function ClientsPage() {
  const { user, resource } = await readClients();
  return <WorkspaceShell user={user} active="clientes"><ClientsView resource={resource} actions={{ createClient, updateClient, deleteClient }} /></WorkspaceShell>;
}
