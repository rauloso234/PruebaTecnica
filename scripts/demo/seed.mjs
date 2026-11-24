import { randomUUID } from "node:crypto";

const marker = "ClientFlow demo v1";
const clients = [
  ["Alba Soto", "Estudio Ladera"], ["Bruno Vidal", "Norte Circular"],
  ["Celia Mora", "Taller Olmo"], ["Dario Lago", "Brisa Digital"],
  ["Eva Rios", "Trazo Local"], ["Fabio Vega", "Punto Nube"],
];
const opportunities = [
  [0, "Auditoría comercial", "new", "1200.00", "2027-01-15"],
  [1, "Rediseño del catálogo", "new", "2450.50", "2027-02-12"],
  [2, "Taller de ventas", "qualified", "810.00", "2026-12-10"],
  [3, "Lanzamiento regional", "qualified", "3200.00", "2027-01-29"],
  [4, "Identidad visual", "proposal", "4850.75", "2026-12-18"],
  [5, "Mapa de clientes", "proposal", "650.00", "2027-01-08"],
  [0, "Plan trimestral", "won", "1600.00", "2026-11-06"],
  [1, "Optimización del embudo", "won", "3200.00", "2026-11-13"],
  [2, "Campaña piloto", "lost", "1200.00", "2026-11-20"],
  [3, "Por definir", "new", "0.00", "2027-02-26"],
];

function summarizeDemo() {
  const stages = { new: 0, qualified: 0, proposal: 0, won: 0, lost: 0 };
  const dates = new Set();
  for (const [index, , status, , date] of opportunities) {
    const timestamp = Date.parse(date);
    if (!Object.hasOwn(clients, index) || !Object.hasOwn(stages, status)
      || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(timestamp)
      || new Date(timestamp).toISOString().slice(0, 10) !== date) {
      throw new Error("Invalid demo opportunity.");
    }
    stages[status]++;
    dates.add(date);
  }
  if (clients.length !== 6 || opportunities.length !== 10
    || Object.values(stages).includes(0) || dates.size !== opportunities.length) {
    throw new Error("Invalid demo distribution.");
  }
  return {
    clients: clients.length,
    opportunities: opportunities.length,
    stages,
    distinctExpectedCloseDates: dates.size,
  };
}

async function seed(summary) {
  const { requireOptIn, signIn } = await import("./supabase.mjs");
  requireOptIn("CRM_DEMO_SEED");
  const { db } = await signIn("A");
  const previous = await db.from("clients").select("id").like("notes", `${marker}:%`).limit(1);
  if (previous.error) throw new Error("Could not check for an existing demo.");
  if (previous.data.length) throw new Error("This account already contains the demo.");

  const tag = `${marker}:${randomUUID()}`;
  try {
    const inserted = await db.from("clients")
      .insert(clients.map(([name, company]) => ({ name, company, notes: tag })))
      .select("id,name");
    if (inserted.error || inserted.data.length !== clients.length) throw new Error("Incomplete demo client insert.");
    const ids = new Map(inserted.data.map(({ id, name }) => [name, id]));
    const result = await db.from("opportunities").insert(opportunities.map(([index, title, status, amount, date]) => ({
      client_id: ids.get(clients[index][0]), title, status, amount, expected_close_date: date,
    })));
    if (result.error) throw new Error("Demo opportunity insert failed.");
  } catch {
    // The FK protects clients if the opportunity request committed before a transport failure.
    const cleanup = await db.from("clients").delete().eq("notes", tag);
    throw new Error(cleanup.error
      ? "Seed confirmation failed. Review the demo records in account A before retrying."
      : "Seed failed. The clients created by this run were removed.");
  }
  console.log(`Demo seeded: ${summary.clients} clients and ${summary.opportunities} opportunities.`);
}

try {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--dry-run") {
    console.log(JSON.stringify(summarizeDemo()));
  } else if (args.length === 0) {
    await seed(summarizeDemo());
  } else {
    console.error("Usage: node scripts/demo/seed.mjs [--dry-run]");
    process.exitCode = 1;
  }
} catch (error) {
  // Never print upstream responses or credentials.
  const safeMessage = error instanceof Error && /^(Set CRM_|Missing environment variable CRM_|Use a Supabase publishable|Could not sign in to test account|Could not check for an existing demo|This account already contains the demo|Seed confirmation failed|Seed failed)/.test(error.message);
  console.error(safeMessage ? error.message : "Demo seed failed.");
  process.exitCode = 1;
}
