import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "@/app/globals.css";
import { WorkspaceShell, type WorkspaceSection } from "@/components/layout/workspace-shell";
import { ClientDetail } from "@/features/clients/client-detail";
import { ClientsView } from "@/features/clients/clients-view";
import { DashboardView } from "@/features/dashboard/dashboard-view";
import { OpportunitiesView } from "@/features/opportunities/opportunities-view";
import { PipelineView } from "@/features/pipeline/pipeline-view";
import type { ClientActions, Mutation, OpportunityActions } from "@/lib/data/contracts";
import { clientCollection, clients, dashboardSnapshot, linkedClient, opportunities, opportunityCollection } from "../fixtures/crm";

const user = { id: linkedClient.owner_id, displayName: "Operador de pruebas", email: "operador@example.invalid" };
const acknowledge = async (): Promise<Mutation> => ({ ok: true });
const clientActions: ClientActions = { createClient: acknowledge, updateClient: acknowledge, deleteClient: acknowledge };
const opportunityActions: OpportunityActions = { createOpportunity: acknowledge, updateOpportunity: acknowledge, deleteOpportunity: acknowledge, changeStatus: acknowledge };

function Harness() {
  const [, section, clientId] = window.location.pathname.split("/");
  let active: WorkspaceSection = "dashboard";
  let view = <DashboardView displayName={user.displayName} resource={{ state: "ready", data: dashboardSnapshot }} />;
  if (section === "clientes") {
    active = "clientes";
    view = clientId
      ? <ClientDetail resource={{ state: "ready", data: {
          client: clients.find(({ id }) => id === clientId) ?? null,
          opportunities: opportunities.filter(({ client_id }) => client_id === clientId),
        } }} actions={clientActions} />
      : <ClientsView resource={{ state: "ready", data: clientCollection }} actions={clientActions} />;
  } else if (section === "oportunidades") {
    active = "oportunidades";
    view = <OpportunitiesView resource={{ state: "ready", data: opportunityCollection }} actions={opportunityActions} />;
  } else if (section === "pipeline") {
    active = "pipeline";
    view = <PipelineView resource={{ state: "ready", data: opportunityCollection }} actions={opportunityActions} />;
  }

  return (
    <WorkspaceShell user={user} active={active} onSignOut={async () => ({ ok: false, message: "Respuesta del adaptador de pruebas." })}>
      <p className="mb-3 text-sm font-semibold text-muted-foreground">Prueba aislada · Datos de ejemplo</p>
      {view}
    </WorkspaceShell>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("No se encontró la raíz del entorno de pruebas.");
createRoot(root).render(<Harness />);
