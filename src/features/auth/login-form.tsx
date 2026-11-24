"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authUnavailableMessage, type SignInResult } from "@/lib/auth/contracts";
import { loginSchema, type LoginInput } from "./login-schema";

type SignInHandler = (credentials: LoginInput) => Promise<SignInResult>;

export function LoginForm({ onSignIn }: { onSignIn?: SignInHandler }) {
  const [visible, setVisible] = useState(false);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = handleSubmit(async (credentials) => {
    if (!onSignIn) {
      setError("root", { message: authUnavailableMessage });
      return;
    }
    try {
      const result = await onSignIn(credentials);
      if ("error" in result) setError("root", { message: result.error });
      else window.location.replace(result.redirectTo);
    } catch {
      setError("root", { message: "No hemos podido completar el acceso. Inténtalo de nuevo." });
    }
  });

  return (
    <form method="post" onSubmit={submit} noValidate aria-busy={isSubmitting} className="mt-6 space-y-4">
      {!onSignIn && (
        <p className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-3 text-sm leading-relaxed text-blue-950">
          <LockKeyhole className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{authUnavailableMessage}</span>
        </p>
      )}
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="block text-sm font-semibold text-navy">Correo electrónico</label>
        <Input id="login-email" type="email" autoComplete="email" placeholder="tu@empresa.es" required
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          {...register("email")} />
        {errors.email && <p id="login-email-error" role="alert" className="text-sm text-red-700">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="login-password" className="block text-sm font-semibold text-navy">Contraseña</label>
        <div className="relative">
          <Input id="login-password" type={visible ? "text" : "password"} autoComplete="current-password" placeholder="Tu contraseña" required className="pr-12"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            {...register("password")} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-controls="login-password"
            onClick={() => setVisible(!visible)}
            className="absolute top-1 right-1 text-slate-600"
          >
            {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </Button>
        </div>
        {errors.password && <p id="login-password-error" role="alert" className="text-sm text-red-700">{errors.password.message}</p>}
      </div>
      {errors.root?.message && (
        <p role="alert" className="flex items-start gap-2 text-sm leading-relaxed text-red-700">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{errors.root.message}</span>
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
        {isSubmitting ? "Comprobando…" : "Acceder"}
      </Button>
    </form>
  );
}
