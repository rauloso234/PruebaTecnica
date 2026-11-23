import { expect, test, type Page } from "@playwright/test";
import { linkedClient } from "../fixtures/crm";

const harnessURL = "http://127.0.0.1:3162";

async function expectNoPageOverflow(page: Page) {
  const actualWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(actualWidth).toBeLessThanOrEqual(page.viewportSize()?.width ?? actualWidth);
}

for (const width of [375, 768, 1280]) {
  test(`CRM aislado a ${width} px: navegación, clientes, formularios y pipeline`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${harnessURL}/clientes`);
    await expect(page.getByRole("heading", { name: "Clientes", exact: true })).toBeVisible();
    await expect(page.getByText("Prueba aislada · Datos de ejemplo")).toBeVisible();
    await expectNoPageOverflow(page);

    if (width < 1024) {
      const menu = page.getByRole("button", { name: "Abrir menú" });
      await menu.focus();
      await page.keyboard.press("Enter");
      const drawer = page.getByRole("dialog", { name: "Menú de ClientFlow" });
      await expect(drawer.getByRole("link", { name: "Clientes" })).toHaveAttribute("aria-current", "page");
      await page.keyboard.press("Escape");
      await expect(drawer).toBeHidden();
      await expect(menu).toBeFocused();
    } else {
      await expect(page.getByRole("navigation", { name: "Navegación del CRM" }).getByRole("link", { name: "Clientes" }))
        .toHaveAttribute("aria-current", "page");
    }

    if (width < 768) await expect(page.getByRole("list", { name: "Listado de clientes" })).toBeVisible();
    else await expect(page.getByRole("table", { name: "Listado de clientes" })).toBeVisible();

    const trigger = page.getByRole("button", { name: "Nuevo cliente", exact: true });
    await trigger.focus();
    expect(await trigger.evaluate((element) => window.getComputedStyle(element).outlineWidth)).toBe("2px");
    await page.keyboard.press("Enter");
    const editor = page.getByRole("dialog", { name: "Nuevo cliente" });
    await expect(editor).toBeVisible();
    const name = editor.getByLabel("Nombre", { exact: true });
    const company = editor.getByLabel("Empresa", { exact: true });
    const nameBounds = await name.boundingBox();
    const companyBounds = await company.boundingBox();
    expect(nameBounds).not.toBeNull();
    expect(companyBounds).not.toBeNull();
    if (width < 768) {
      expect(companyBounds?.x).toBe(nameBounds?.x);
      expect(companyBounds?.y).toBeGreaterThan(nameBounds?.y ?? 0);
    } else {
      expect(companyBounds?.y).toBe(nameBounds?.y);
      expect(companyBounds?.x).toBeGreaterThan(nameBounds?.x ?? 0);
    }
    await page.keyboard.press("Escape");
    await expect(editor).toBeHidden();
    await expect(trigger).toBeFocused();

    await page.goto(`${harnessURL}/pipeline`);
    await expect(page.getByRole("heading", { name: "Pipeline comercial" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(5);
    await expectNoPageOverflow(page);
    const selector = page.getByLabel("Cambiar etapa de Primera consulta");
    await page.evaluate(async () => { await document.fonts.ready; });
    const selectSize = await selector.evaluate((element: HTMLSelectElement) => {
      const style = getComputedStyle(element);
      const canvas = document.createElement("canvas").getContext("2d");
      if (!canvas) throw new Error("No se pudo medir la etiqueta del selector.");
      canvas.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      return {
        fontSize: style.fontSize,
        availableWidth: element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
        longestLabelWidth: Math.ceil(Math.max(...Array.from(element.options, (option) => canvas.measureText(option.label).width))),
      };
    });
    expect(selectSize.fontSize).toBe("14px");
    expect(selectSize.availableWidth, "Todas las etapas deben caber junto a la flecha").toBeGreaterThanOrEqual(selectSize.longestLabelWidth);
    await selector.focus();
    await page.keyboard.press("ArrowDown");
    await expect(selector).toHaveValue("qualified");
    await expect(page.getByRole("button", { name: "Aplicar etapa" })).toBeVisible();
  });
}

test("el CRM aislado comunica restricciones y confirma una operación solo tras la respuesta", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${harnessURL}/clientes/${linkedClient.id}`);
  await expect(page.getByRole("complementary").getByText("Operador de pruebas", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page.getByRole("complementary").getByRole("alert")).toHaveText("Respuesta del adaptador de pruebas.");
  await page.getByRole("button", { name: `Eliminar ${linkedClient.name}` }).click();
  const restriction = page.getByRole("alertdialog", { name: "Eliminar cliente" });
  await expect(restriction).toContainText("oportunidades vinculadas");
  await expect(restriction.getByRole("button", { name: "Confirmar eliminación" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(restriction).toBeHidden();

  await page.goto(`${harnessURL}/clientes`);
  await page.getByRole("button", { name: "Nuevo cliente", exact: true }).click();
  const form = page.getByRole("dialog", { name: "Nuevo cliente" });
  await form.getByLabel("Nombre", { exact: true }).fill("Contacto nuevo de prueba");
  await expect(page.getByText("Cliente creado.", { exact: true })).toHaveCount(0);
  await form.getByRole("button", { name: "Crear cliente" }).click();
  await expect(form).toBeHidden();
  await expect(page.getByText("Cliente creado.", { exact: true })).toBeVisible();
});
