export type VerifiedSession = Readonly<{
  user: Readonly<{ id: string; email: string; displayName?: string }>;
}>;

export type SignInResult = { error: string } | { redirectTo: string };

export const authUnavailableMessage = "El inicio de sesión todavía no está disponible. La conexión de autenticación está pendiente.";
