import type { ReactNode } from "react";
import { WorkspaceSessionProvider } from "@/components/layout/workspace-shell";
import { signOut } from "@/features/auth/actions";
import { requireSession } from "@/lib/auth/session";

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  await requireSession();
  return <WorkspaceSessionProvider signOutAction={signOut}>{children}</WorkspaceSessionProvider>;
}
