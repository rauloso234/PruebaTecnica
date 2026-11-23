import { describe, expect, it } from "vitest";
import { parseEuroCents } from "@/lib/domain/format";
import { opportunityStatuses } from "@/lib/domain/models";
import { clientSchema, opportunitySchema, statusSchema } from "@/lib/domain/validation";
import { linkedClient } from "../fixtures/crm";

const emptyClient = { name: "", company: "", email: "", phone: "", notes: "" };
const validOpportunity = { title: "   Plan   anual ", client_id: linkedClient.id, description: "", amount: "0", status: "new" as const, expected_close_date: "" };

describe("Validación comercial", () => {
  it("normaliza nombres y opcionales sin alterar las líneas de las notas", () => {
    const result = clientSchema.parse({ ...emptyClient, name: " Clara   Ruiz  ", company: " Taller   Azul ", notes: "  Primera línea\nSegunda línea  " });
    expect(result).toEqual({ name: "Clara Ruiz", company: "Taller Azul", email: null, phone: null, notes: "Primera línea\nSegunda línea" });
  });

  it("rechaza nombres vacíos, correos inválidos y límites excesivos", () => {
    const result = clientSchema.safeParse({ ...emptyClient, name: "  ", email: "grr", phone: "0".repeat(31), notes: "x".repeat(2001) });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map((issue) => issue.path[0])).toEqual(["name", "email", "phone", "notes"]);
    expect(clientSchema.safeParse({ ...emptyClient, name: "z".repeat(121) }).success).toBe(false);
  });

  it("admite los cinco estados acordados, cero y fecha opcional", () => {
    for (const status of opportunityStatuses) expect(statusSchema.parse(status)).toBe(status);
    expect(statusSchema.safeParse("contacted").success).toBe(false);
    expect(opportunitySchema.parse(validOpportunity)).toEqual({
      title: "Plan anual", client_id: linkedClient.id, description: null, amountCents: 0, status: "new", expected_close_date: null,
    });
    expect(opportunitySchema.parse({ ...validOpportunity, expected_close_date: "2032-02-29" }).expected_close_date).toBe("2032-02-29");
  });

  it("rechaza el título vacío, un cliente ausente y fechas inexistentes", () => {
    const result = opportunitySchema.safeParse({ ...validOpportunity, title: "  ", client_id: "", expected_close_date: "2031-02-29" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map((issue) => issue.path[0])).toEqual(["title", "client_id", "expected_close_date"]);
  });

  it("interpreta importes con coma o punto sin redondear entradas inválidas", () => {
    expect(parseEuroCents(" 18,03 ")).toBe(1803);
    expect(parseEuroCents("0.2")).toBe(20);
    expect(parseEuroCents("999999999,99")).toBe(99_999_999_999);
    for (const value of ["-1", "0,001", "1,2.3", "1.000,20", "2e3", "1000000000", ""]) {
      expect(parseEuroCents(value)).toBeNull();
      expect(opportunitySchema.safeParse({ ...validOpportunity, amount: value }).success).toBe(false);
    }
  });
});
