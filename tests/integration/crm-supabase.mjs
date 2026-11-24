import { randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { createPublicClient, requireOptIn, signIn } from "../../scripts/demo/supabase.mjs";

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function accepted(result, message) {
  check(!result.error && result.data, message);
  return result.data;
}

function denied(result, code, message) {
  const matches = code
    ? result.error?.code === code
    : !result.error && Array.isArray(result.data) && result.data.length === 0;
  check(matches, message);
}

async function readRow(db, table, id) {
  return accepted(await db.from(table).select("*").eq("id", id).single(), `Could not reload own ${table} row.`);
}

async function deniedWrite(query, code, message, ...snapshots) {
  const result = await query;
  const current = await Promise.all(snapshots.map(({ db, table, row }) => readRow(db, table, row.id)));
  for (const [index, { table, row }] of snapshots.entries()) {
    check(isDeepStrictEqual(current[index], row), `${message} Own ${table} row changed.`);
  }
  denied(result, code, message);
}

async function run() {
  requireOptIn("CRM_RUN_SUPABASE_TESTS");
  const [a, b] = await Promise.all([signIn("A"), signIn("B")]);
  check(a.userId !== b.userId, "A and B must be different accounts.");
  const anon = createPublicClient();
  const tag = `CRM integration ${randomUUID()}`;
  const expected = [
    ["new", "0.10"], ["qualified", "0.20"], ["proposal", "10.00"],
    ["won", "30.00"], ["won", "40.00"], ["lost", "999.00"],
  ];
  const titles = expected.map((_, index) => `${tag} ${index}`);
  const cleanupTargets = [
    ["opportunities", "title", [tag, ...titles]],
    ["clients", "name", [tag, `${tag} updated`]],
  ];
  try {
    async function addClient(account) {
      const row = accepted(await account.db.from("clients").insert({ name: tag }).select("*").single(), "Client insert failed.");
      check(row.user_id === account.userId, "Wrong default client owner.");
      return row;
    }

    const client = await addClient(a);
    const second = await addClient(a);
    const other = await addClient(b);
    const { db } = a;
    const insertResult = await db.from("opportunities").insert(expected.map(([status, amount], index) => ({
      client_id: client.id, title: titles[index], status, amount, expected_close_date: "2028-02-29",
    }))).select("*");
    // Stop after the server confirms the insert, before the test uses any returned IDs.
    if (process.env.CRM_SIMULATE_LOST_INSERT_RESPONSE === "1" && !insertResult.error) {
      check(false, "Simulated loss of opportunity insert response.");
    }
    const inserted = accepted(insertResult, "Opportunity insert failed.");
    check(inserted.length === expected.length && inserted.every(({ user_id }) => user_id === a.userId), "Wrong default opportunity owner.");
    const opportunity = inserted.find(({ title }) => title === titles[0]);
    check(opportunity, "Expected opportunity missing from insert response.");
    const { id } = opportunity;
    const draft = { client_id: client.id, title: tag, status: "new", amount: "0.01" };
    const ownBDraft = { ...draft, client_id: other.id };
    const ownB = accepted(await b.db.from("opportunities").insert(ownBDraft).select("*").single(), "B own insert failed.");

    for (const [ownerDb, foreignDb, table, row, change] of [
      [db, b.db, "clients", client, { name: `${tag} updated` }],
      [b.db, db, "clients", other, { name: `${tag} updated` }],
      [db, b.db, "opportunities", opportunity, { status: "won" }],
      [b.db, db, "opportunities", ownB, { status: "won" }],
    ]) {
      for (const [actor, actorDb, code] of [["Foreign", foreignDb, null], ["Anonymous", anon, "42501"]]) {
        const snapshot = { db: ownerDb, table, row };
        denied(await actorDb.from(table).select("id").eq("id", row.id), code, `${actor} ${table} read was not denied as expected.`);
        await deniedWrite(actorDb.from(table).update(change).eq("id", row.id).select("id"), code,
          `${actor} ${table} update was not denied as expected.`, snapshot);
        await deniedWrite(actorDb.from(table).delete().eq("id", row.id).select("id"), code,
          `${actor} ${table} delete was not denied as expected.`, snapshot);
      }
    }
    const aClient = { db, table: "clients", row: client };
    const bOpportunity = { db: b.db, table: "opportunities", row: ownB };
    await deniedWrite(anon.from("clients").insert({ name: tag }), "42501", "Anonymous client insert was not denied as expected.", aClient);
    await deniedWrite(anon.from("opportunities").insert(draft), "42501", "Anonymous opportunity insert was not denied as expected.",
      aClient, { db, table: "opportunities", row: opportunity });
    for (const [table, row, payload] of [["clients", other, { name: tag }], ["opportunities", ownB, ownBDraft]]) {
      const snapshot = { db: b.db, table, row };
      await deniedWrite(b.db.from(table).insert({ ...payload, user_id: a.userId }), "42501",
        `${table} insert with forged owner was not denied as expected.`, snapshot);
      await deniedWrite(b.db.from(table).update({ user_id: a.userId }).eq("id", row.id), "42501",
        `${table} owner change was not denied as expected.`, snapshot);
      for (const [column, value] of Object.entries({
        id: randomUUID(),
        user_id: b.userId,
        created_at: "2020-01-01T00:00:00Z",
        updated_at: "2020-01-01T00:00:00Z",
      })) {
        await deniedWrite(b.db.from(table).insert({ ...payload, [column]: value }), "42501",
          `${table} insert with protected column ${column} was not denied as expected.`, snapshot);
        await deniedWrite(b.db.from(table).update({ [column]: value }).eq("id", row.id), "42501",
          `${table} update with protected column ${column} was not denied as expected.`, snapshot);
      }
    }
    await deniedWrite(b.db.from("opportunities").insert(draft), "23503",
      "Cross-owner opportunity insert did not fail the foreign key.", aClient, bOpportunity);
    await deniedWrite(b.db.from("opportunities").update({ client_id: client.id }).eq("id", ownB.id), "23503",
      "Cross-owner opportunity update did not fail the foreign key.", aClient, bOpportunity);
    await deniedWrite(db.from("clients").delete().eq("id", client.id), "23503",
      "Linked client delete did not fail the foreign key.", aClient,
      ...inserted.map((row) => ({ db, table: "opportunities", row })));

    const rows = accepted(await db.from("opportunities").select("id,client_id,title,status,amount,expected_close_date")
      .in("id", [...inserted.map(({ id: rowId }) => rowId), ownB.id]), "A opportunity read failed.");
    check(rows.length === expected.length && rows.every((row) => row.client_id === client.id && row.expected_close_date === "2028-02-29"), "Isolation, link or date persistence failed.");
    for (const [index, [status, amount]] of expected.entries()) {
      const row = rows.find(({ title }) => title === `${tag} ${index}`);
      check(row?.status === status && Number(row.amount) === Number(amount), "Unexpected stage or amount after unauthorized writes.");
    }

    accepted(await db.from("clients").update({ name: `${tag} updated` }).eq("id", second.id)
      .select("id").single(), "Own client update failed.");
    check((await readRow(db, "clients", second.id)).name === `${tag} updated`, "Own client update did not persist.");
    accepted(await db.from("opportunities").update({ status: "proposal", client_id: second.id })
      .eq("id", id).select("id").single(), "Own stage or link update failed.");
    const moved = accepted(await db.from("opportunities").select("status,client_id")
      .eq("id", id).single(), "Could not reload moved opportunity.");
    check(moved.status === "proposal" && moved.client_id === second.id, "Own stage or link did not persist.");
    accepted(await db.from("opportunities").delete().eq("id", id).select("id").single(), "Own opportunity delete failed.");
    denied(await db.from("opportunities").select("id").eq("id", id), null, "Own opportunity still present after delete.");
    accepted(await db.from("clients").delete().eq("id", second.id).select("id").single(), "Own unlinked client delete failed.");
    denied(await db.from("clients").select("id").eq("id", second.id), null, "Own client still present after delete.");
  } finally {
    const cleanup = [];
    for (const [table, column, labels] of cleanupTargets) {
      cleanup.push(...await Promise.allSettled([a, b].map(async ({ db, userId }) =>
        db.from(table).delete().eq("user_id", userId).in(column, labels))));
    }
    const remaining = await Promise.allSettled(cleanupTargets.flatMap(([table, column, labels]) =>
      [a, b].map(async ({ db, userId }) => db.from(table).select("id").eq("user_id", userId).in(column, labels))));
    check(cleanup.every((result) => result.status === "fulfilled" && !result.value.error)
      && remaining.every((result) => result.status === "fulfilled" && !result.value.error
        && Array.isArray(result.value.data) && result.value.data.length === 0),
    `Could not confirm cleanup for exact run label ${tag}.`);
    console.log("Cleanup verified for both accounts.");
  }
  console.log("CRM Supabase CRUD and A/B isolation checks succeeded.");
}

try {
  await run();
} catch (error) {
  // Show only messages from the test and environment guards. Upstream responses could contain secrets.
  const safe = error instanceof Error && error.stack?.split("\n")[1]?.match(/at (check|requireOptIn|env|createPublicClient|signIn) /);
  console.error(safe ? error.message : "CRM Supabase checks failed.");
  process.exitCode = 1;
}
