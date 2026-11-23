// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/features/auth/login-form";
import { authUnavailableMessage } from "@/lib/auth/contracts";

describe("Formulario de acceso", () => {
  it("muestra validaciones en español y alterna la visibilidad de la contraseña por teclado", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText("Correo electrónico"), "incorrecto");
    await user.click(screen.getByRole("button", { name: "Acceder" }));

    const email = screen.getByLabelText("Correo electrónico");
    const password = screen.getByLabelText("Contraseña", { exact: true });
    expect(await screen.findByText("Introduce un correo electrónico válido.")).toBeVisible();
    expect(email).toHaveAccessibleDescription("Introduce un correo electrónico válido.");
    expect(password).toHaveAccessibleDescription("Introduce tu contraseña.");
    expect(password).toHaveAttribute("type", "password");

    screen.getByRole("button", { name: "Mostrar contraseña" }).focus();
    await user.keyboard("{Enter}");
    expect(password).toHaveAttribute("type", "text");
    await user.keyboard("{Enter}");
    expect(password).toHaveAttribute("type", "password");
  });

  it("mantiene acceso indisponible tras enviar campos válidos sin integración", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    expect(screen.getByText(authUnavailableMessage)).toBeVisible();
    await user.type(screen.getByLabelText("Correo electrónico"), "prueba@example.invalid");
    await user.type(screen.getByLabelText("Contraseña", { exact: true }), "entrada-de-prueba");
    await user.click(screen.getByRole("button", { name: "Acceder" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(authUnavailableMessage);
  });

  it("marca el envío en curso y deja reintentar cuando el adaptador rechaza el acceso", async () => {
    const user = userEvent.setup();
    let finishRequest: (result: { error: string }) => void = () => {};
    const onSignIn = vi.fn(() => new Promise<{ error: string }>((resolve) => { finishRequest = resolve; }));
    render(<LoginForm onSignIn={onSignIn} />);
    await user.type(screen.getByLabelText("Correo electrónico"), "prueba@example.invalid");
    await user.type(screen.getByLabelText("Contraseña", { exact: true }), "entrada-de-prueba");
    await user.click(screen.getByRole("button", { name: "Acceder" }));

    const pending = await screen.findByRole("button", { name: "Comprobando…" });
    expect(pending).toBeDisabled();
    await user.click(pending);
    expect(onSignIn).toHaveBeenCalledTimes(1);
    finishRequest({ error: "Acceso no disponible." });
    expect(await screen.findByRole("alert")).toHaveTextContent("Acceso no disponible.");
    expect(screen.getByRole("button", { name: "Acceder" })).toBeEnabled();
  });
});
