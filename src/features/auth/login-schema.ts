import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim()
    .min(1, "Introduce tu correo electrónico.")
    .max(254, "El correo electrónico es demasiado largo.")
    .pipe(z.email("Introduce un correo electrónico válido.")),
  password: z.string()
    .min(1, "Introduce tu contraseña.")
    .max(256, "La contraseña es demasiado larga."),
});

export type LoginInput = z.infer<typeof loginSchema>;
