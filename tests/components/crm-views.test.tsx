// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClientsView } from "@/features/clients/clients-view";
import { ClientDetail } from "@/features/clients/client-detail";
import { DashboardView } from "@/features/dashboard/dashboard-view";
import { OpportunitiesView } from "@/features/opportunities/opportunities-view";
import { PipelineView } from "@/features/pipeline/pipeline-view";
import type { Mutation } from "@/lib/data/contracts";
import { clientCollection, dashboardSnapshot, linkedClient, opportunities, opportunityCollection, unlinkedClient } from "../fixtures/crm";

describe("Clientes", () => {
  it("diferencia la colección vacía, búsqueda sin resultados y conexión pendiente", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ClientsView resource={{ state: "ready", data: { clients: [], linkedClientIds: [] } }} />);
    expect(screen.getByText("Aún no tienes clientes")).toBeVisible();
    rerender(<ClientsView resource={{ state: "ready", data: clientCollection }} />);
    const table = screen.getByRole("table", { name: "Listado de clientes" });
    expect(within(table).getByRole("link", { name: linkedClient.name })).toHaveAttribute("href", `/clientes/${linkedClient.id}`);
    await user.type(screen.getByLabelText("Buscar clientes"), "oficina");
    expect(within(table).queryByText(linkedClient.name)).not.toBeInTheDocument();
    expect(within(table).getByText(unlinkedClient.name)).toBeVisible();
    await user.type(screen.getByLabelText("Buscar clientes"), " inexistente");
    expect(screen.getByText("No encontramos coincidencias")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
    expect(screen.getByLabelText("Buscar clientes")).toHaveValue("");
    rerender(<ClientsView resource={{ state: "unavailable" }} />);
    expect(screen.getByText("Conexión pendiente")).toBeVisible();
  });

  it("valida el alta, espera confirmación y permite reintentar ante un error", async () => {
    const user = userEvent.setup();
    let finish: (result: Mutation) => void = () => {};
    const createClient = vi.fn(() => new Promise<Mutation>((resolve) => { finish = resolve; }));
    render(<ClientsView resource={{ state: "ready", data: clientCollection }} actions={{ createClient }} />);
    const trigger = screen.getByRole("button", { name: "Nuevo cliente" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Nuevo cliente" });
    await user.click(within(dialog).getByRole("button", { name: "Crear cliente" }));
    expect(await within(dialog).findByText("Introduce un nombre.")).toBeVisible();
    const name = within(dialog).getByLabelText("Nombre");
    expect(name).toHaveAccessibleDescription("Introduce un nombre.");
    await user.type(name, "   Contacto    nuevo  ");
    await user.click(within(dialog).getByRole("button", { name: "Crear cliente" }));
    expect(await within(dialog).findByRole("button", { name: "Guardando…" })).toBeDisabled();
    expect(createClient).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ name: "Contacto nuevo", email: null }));
    finish({ ok: false, message: "No pudimos guardar el registro." });
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("No pudimos guardar el registro.");
    await user.click(within(dialog).getByRole("button", { name: "Crear cliente" }));
    await within(dialog).findByRole("button", { name: "Guardando…" });
    finish({ ok: true });
    await vi.waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("muestra el detalle e impide eliminar un cliente que tiene oportunidades", async () => {
    const user = userEvent.setup();
    const deleteClient = vi.fn(async (): Promise<Mutation> => ({ ok: true }));
    const { rerender } = render(<ClientDetail resource={{ state: "ready", data: { client: linkedClient, opportunities } }} actions={{ deleteClient }} />);
    expect(screen.getByText(linkedClient.notes ?? "")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Oportunidades asociadas" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: `Eliminar ${linkedClient.name}` }));
    const blocked = screen.getByRole("alertdialog", { name: "Eliminar cliente" });
    expect(blocked).toHaveTextContent(/oportunidades vinculadas/);
    expect(within(blocked).queryByRole("button", { name: "Confirmar eliminación" })).not.toBeInTheDocument();
    expect(deleteClient).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    rerender(<ClientDetail resource={{ state: "ready", data: { client: unlinkedClient, opportunities: [] } }} actions={{ deleteClient }} />);
    await user.click(screen.getByRole("button", { name: `Eliminar ${unlinkedClient.name}` }));
    await user.click(screen.getByRole("button", { name: "Confirmar eliminación" }));
    expect(deleteClient).toHaveBeenCalledExactlyOnceWith(unlinkedClient.id);
  });

  it("comunica el estado de carga y permite solicitar otro intento tras un error", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const { rerender } = render(<ClientsView resource={{ state: "loading" }} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    rerender(<ClientsView resource={{ state: "error", message: "No hay conexión." }} onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("No hay conexión.");
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("Oportunidades, panel y pipeline", () => {
  it("filtra el listado y guarda una oportunidad validada vinculada a un cliente", async () => {
    const user = userEvent.setup();
    const createOpportunity = vi.fn(async (): Promise<Mutation> => ({ ok: true }));
    render(<OpportunitiesView resource={{ state: "ready", data: opportunityCollection }} actions={{ createOpportunity }} />);
    const table = screen.getByRole("table", { name: "Listado de oportunidades" });
    await user.selectOptions(screen.getByLabelText("Filtrar por etapa"), "won");
    expect(within(table).getByText("Proyecto ganado")).toBeVisible();
    expect(within(table).queryByText("Primera consulta")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Buscar oportunidades"), "no existe");
    expect(screen.getByText("No encontramos coincidencias")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    await user.click(screen.getByRole("button", { name: "Nueva oportunidad" }));
    const dialog = screen.getByRole("dialog", { name: "Nueva oportunidad" });
    const submit = within(dialog).getByRole("button", { name: "Crear oportunidad" });
    await user.click(submit);
    expect(await within(dialog).findByText("Introduce un título.")).toBeVisible();
    expect(within(dialog).getByLabelText("Cliente")).toHaveAccessibleDescription("Selecciona un cliente.");
    await user.type(within(dialog).getByLabelText("Título"), "   Diagnóstico     inicial ");
    await user.selectOptions(within(dialog).getByLabelText("Cliente"), linkedClient.id);
    const amount = within(dialog).getByLabelText("Importe (€)");
    await user.clear(amount);
    await user.type(amount, "0,20");
    await user.click(submit);
    expect(createOpportunity).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ title: "Diagnóstico inicial", client_id: linkedClient.id, amountCents: 20, status: "new" }));
  });

  it("envía el borrado y la edición de oportunidad solo tras confirmación", async () => {
    const user = userEvent.setup();
    const updateOpportunity = vi.fn(async (): Promise<Mutation> => ({ ok: true }));
    const deleteOpportunity = vi.fn(async (): Promise<Mutation> => ({ ok: true }));
    render(<OpportunitiesView resource={{ state: "ready", data: opportunityCollection }} actions={{ updateOpportunity, deleteOpportunity }} />);
    const row = within(screen.getByRole("table")).getByRole("row", { name: /Primera consulta/ });
    await user.click(within(row).getByRole("button", { name: "Editar Primera consulta" }));
    const editor = screen.getByRole("dialog", { name: "Editar oportunidad" });
    expect(within(editor).getByLabelText("Título")).toHaveValue("Primera consulta");
    await user.click(within(editor).getByRole("button", { name: "Guardar cambios" }));
    expect(updateOpportunity).toHaveBeenCalledExactlyOnceWith(opportunities[0].id, expect.objectContaining({ amountCents: 10 }));
    await user.click(within(row).getByRole("button", { name: "Eliminar Primera consulta" }));
    expect(deleteOpportunity).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Confirmar eliminación" }));
    expect(deleteOpportunity).toHaveBeenCalledExactlyOnceWith(opportunities[0].id);
  });

  it("renderiza cinco métricas y no confunde un panel vacío con uno desconectado", () => {
    const { rerender } = render(<DashboardView resource={{ state: "ready", data: dashboardSnapshot }} />);
    const summary = screen.getByRole("region", { name: "Resumen comercial" });
    expect(within(summary).getByText("Oportunidades abiertas")).toBeVisible();
    expect(summary).toHaveTextContent(/10,30\s€.*70,00\s€.*66,67 %/);
    expect(screen.getByRole("heading", { name: "Últimas oportunidades" })).toBeVisible();
    rerender(<DashboardView resource={{ state: "ready", data: { clients: [], opportunities: [], clientCount: 0 } }} />);
    expect(screen.getByText("Sin oportunidades recientes")).toBeVisible();
    expect(summary).toHaveTextContent("0 %");
    rerender(<DashboardView resource={{ state: "unavailable" }} />);
    expect(screen.getByText("Conexión pendiente")).toBeVisible();
    expect(summary).not.toHaveTextContent("0 %");
  });

  it("muestra etapas y tarjetas, conserva el estado ante error y evita cambios desconectados", async () => {
    const user = userEvent.setup();
    let finish: (result: Mutation) => void = () => {};
    const changeStatus = vi.fn(() => new Promise<Mutation>((resolve) => { finish = resolve; }));
    const resource = { state: "ready" as const, data: opportunityCollection };
    const { rerender } = render(<PipelineView resource={resource} actions={{ changeStatus }} />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual(["Nuevo contacto", "Cualificado", "Propuesta", "Ganado", "Perdido"]);
    const stage = screen.getByRole("region", { name: "Nuevo contacto" });
    expect(within(stage).getByRole("heading", { name: "Primera consulta" })).toBeVisible();
    expect(stage).toHaveTextContent(/0,10\s€/);
    const select = within(stage).getByLabelText("Cambiar etapa de Primera consulta");
    await user.selectOptions(select, "qualified");
    expect(changeStatus).not.toHaveBeenCalled();
    await user.click(within(stage).getByRole("button", { name: "Aplicar etapa" }));
    expect(select).toBeDisabled();
    expect(changeStatus).toHaveBeenCalledExactlyOnceWith(opportunities[0].id, "qualified");
    finish({ ok: false, message: "No se guardó el cambio." });
    expect(await within(stage).findByRole("alert")).toHaveTextContent("No se guardó el cambio.");
    expect(select).toHaveValue("new");
    rerender(<PipelineView resource={resource} />);
    expect(select).toBeDisabled();
    expect(screen.getAllByText("Requiere conexión a la base de datos.")).toHaveLength(opportunities.length);
  });
});
