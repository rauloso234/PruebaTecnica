import { expect, test } from "@playwright/test";

test("la landing presenta el producto y conduce a un acceso pendiente de conexión", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Tus clientes y oportunidades, bajo control." })).toBeVisible();
  await expect(page.getByText("Centraliza tu información comercial, organiza tus oportunidades y sigue el crecimiento de tu negocio desde un único lugar.")).toBeVisible();
  await expect(page.getByText("Vista ilustrativa · Datos de ejemplo")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gestión centralizada de clientes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Seguimiento de oportunidades" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Estadísticas comerciales" })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await page.getByRole("link", { name: "Acceder a ClientFlow" }).first().click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
  await expect(page.getByText(/La conexión de autenticación está pendiente/)).toBeVisible();
});

test("el formulario valida entradas y permite ver la contraseña sin iniciar sesión", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Acceder", exact: true }).click();
  const email = page.getByLabel("Correo electrónico");
  const password = page.getByLabel("Contraseña", { exact: true });
  await expect(email).toHaveAccessibleDescription("Introduce tu correo electrónico.");
  await expect(password).toHaveAccessibleDescription("Introduce tu contraseña.");
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Mostrar contraseña" }).press("Enter");
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Ocultar contraseña" }).press("Enter");
  await expect(password).toHaveAttribute("type", "password");
  await email.fill("e2e@example.invalid");
  await password.fill("entrada-de-prueba");
  await page.getByRole("button", { name: "Acceder", exact: true }).click();
  await expect(page.getByRole("region", { name: "Iniciar sesión" }).getByRole("alert"))
    .toHaveText(/El inicio de sesión todavía no está disponible/);
  await expect(page).toHaveURL(/\/login$/);
});

test("las solicitudes privadas anónimas redirigen a login en el servidor", async ({ request }) => {
  for (const route of ["/dashboard", "/clientes", "/clientes/00000000-0000-0000-0000-000000000001", "/oportunidades", "/pipeline"]) {
    const response = await request.get(route, { maxRedirects: 0 });
    expect(response.status(), route).toBe(307);
    const location = new URL(response.headers().location, response.url());
    expect(location.pathname, route).toBe("/login");
    expect(location.searchParams.get("next"), route).toBe(route);
    expect(response.headers()["cache-control"], route).toContain("no-store");
  }
});

for (const width of [375, 768, 1280]) {
  test(`la web pública conserva navegación y ancho a ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.goto("/login");
    await expect(page.getByLabel("Correo electrónico")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
