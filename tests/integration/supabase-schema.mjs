// Run with Node, passing the path to a temporary @electric-sql/pglite installation.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const { PGlite } = await import(pathToFileURL(resolve(process.argv[2], "dist/index.js")));
const db = new PGlite();
const userA = "00000000-0000-4000-8000-000000000001";
const userB = "00000000-0000-4000-8000-000000000002";
const missingClient = "00000000-0000-4000-8000-000000000003";

async function authenticate(id) {
  await db.exec("reset role; set role authenticated");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
}

async function insertClient(name) {
  const { rows: [client] } = await db.query(
    "insert into public.clients (name) values ($1) returning *", [name],
  );
  return client;
}

async function insertOpportunity(client, amount, status = "new") {
  const { rows: [opportunity] } = await db.query(
    `insert into public.opportunities (client_id, title, amount, status, expected_close_date)
     values ($1, 'Test', $2, $3, date '2026-11-24') returning *`, [client, amount, status],
  );
  return opportunity;
}

try {
  await db.exec(`
    create role anon;
    create role authenticated;
    create role public_only;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable
      as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
  `);
  await db.query("insert into auth.users values ($1), ($2)", [userA, userB]);
  await db.exec(await readFile(new URL(
    "../../supabase/migrations/20261124000100_create_crm.sql", import.meta.url,
  ), "utf8"));

  const { rows: policies } = await db.query(
    "select tablename, cmd, roles from pg_policies where schemaname = 'public' order by tablename, cmd",
  );
  for (const table of ["clients", "opportunities"]) {
    const { rows: [flags] } = await db.query(
      "select relrowsecurity from pg_class where oid = $1::regclass", [`public.${table}`],
    );
    assert.equal(flags.relrowsecurity, true);
    assert.deepEqual(policies.filter((policy) => policy.tablename === table).map((policy) => [
      policy.cmd, policy.roles,
    ]), ["DELETE", "INSERT", "SELECT", "UPDATE"].map((operation) => [operation, ["authenticated"]]));
  }

  await authenticate(userA);
  const client = await insertClient("A");
  const target = await insertClient("A2");
  assert.equal(client.user_id, userA);
  await assert.rejects(insertClient("\t "), { code: "23514" });
  await assert.rejects(insertClient("x".repeat(121)), { code: "23514" });
  const opportunity = await insertOpportunity(client.id, "0");
  assert.equal(opportunity.user_id, userA);
  assert.equal(opportunity.amount, "0.00");
  for (const [amount, status] of [
    ["0.01", "qualified"], ["0.10", "proposal"], ["0.20", "won"], ["999999999.99", "lost"],
  ]) {
    assert.equal((await insertOpportunity(client.id, amount, status)).amount, amount);
  }
  const { rows: [total] } = await db.query(
    "select sum(amount)::text as amount from public.opportunities where status in ('proposal', 'won')",
  );
  assert.equal(total.amount, "0.30");
  for (const amount of ["-0.01", "1000000000", "NaN"]) {
    await assert.rejects(insertOpportunity(client.id, amount), { code: "23514" });
  }
  await assert.rejects(insertOpportunity(client.id, "0", "invalid"), { code: "23514" });
  await assert.rejects(insertOpportunity(missingClient, "0"), { code: "23503" });
  await assert.rejects(db.query("delete from public.clients where id = $1", [client.id]), {
    code: /^(23001|23503)$/,
    constraint: "opportunities_owned_client_fk",
  });

  const { rows: [updated] } = await db.query(
    `update public.opportunities set client_id = $1 where id = $2
     returning updated_at > $3::timestamptz as advanced, created_at`,
    [target.id, opportunity.id, opportunity.updated_at],
  );
  assert.equal(updated.advanced, true);
  assert.deepEqual(updated.created_at, opportunity.created_at);
  for (const zone of ["Pacific/Kiritimati", "Pacific/Honolulu"]) {
    await db.query("select set_config('TimeZone', $1, false)", [zone]);
    const { rows: [date] } = await db.query(
      "select expected_close_date::text as value from public.opportunities where id = $1", [opportunity.id],
    );
    assert.equal(date.value, "2026-11-24");
  }

  await authenticate(userB);
  const other = await insertClient("B");
  const own = await insertOpportunity(other.id, "0");
  await assert.rejects(insertOpportunity(client.id, "0"), { code: "23503" });
  await assert.rejects(db.query(
    "update public.opportunities set client_id = $1 where id = $2", [client.id, own.id],
  ), { code: "23503" });
  for (const [table, row, column, ownId] of [
    ["clients", client, "name", other.id],
    ["opportunities", opportunity, "title", own.id],
  ]) {
    assert.equal((await db.query(`select * from public.${table} where id = $1`, [row.id])).rows.length, 0);
    assert.equal((await db.query(
      `update public.${table} set ${column} = 'Forbidden' where id = $1`, [row.id],
    )).affectedRows, 0);
    assert.equal((await db.query(`delete from public.${table} where id = $1`, [row.id])).affectedRows, 0);
    for (const [protectedColumn, value] of [
      ["user_id", userA], ["created_at", "2000-01-01"], ["updated_at", "2000-01-01"],
    ]) {
      await assert.rejects(db.query(
        `update public.${table} set ${protectedColumn} = $1 where id = $2`, [value, ownId],
      ), { code: "42501" });
      await assert.rejects(db.query(
        `insert into public.${table} (${protectedColumn}) values ($1)`, [value],
      ), { code: "42501" });
    }
  }
  assert.equal((await db.query("delete from public.opportunities where id = $1", [own.id])).affectedRows, 1);
  assert.equal((await db.query("delete from public.clients where id = $1", [other.id])).affectedRows, 1);

  for (const role of ["anon", "public_only"]) {
    await db.exec(`reset role; set role ${role}`);
    for (const [table, column] of [["clients", "name"], ["opportunities", "title"]]) {
      for (const query of [
        `select * from public.${table}`,
        `insert into public.${table} (${column}) values ('Forbidden')`,
        `update public.${table} set ${column} = 'Forbidden'`,
        `delete from public.${table}`,
      ]) {
        await assert.rejects(db.query(query), { code: "42501" });
      }
    }
  }

  await authenticate(userA);
  assert.deepEqual((await db.query("select * from public.clients where id = $1", [client.id])).rows, [client]);
  const { rows: [retained] } = await db.query("select * from public.opportunities where id = $1", [opportunity.id]);
  assert.equal(retained.title, opportunity.title);
  assert.equal(retained.user_id, userA);
  assert.equal(retained.client_id, target.id);
  assert.equal(retained.amount, opportunity.amount);
  console.log("F3-A PostgreSQL schema checks passed (PGlite, simulated Auth roles).");
} finally {
  await db.close();
}
