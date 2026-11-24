"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { Button } from "./button";

const overlayClass = "fixed inset-0 z-40 bg-navy/55";
export const dialogClass = "fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[calc(100dvh-2rem)] max-w-xl -translate-y-1/2 overflow-auto rounded-2xl border border-border bg-card p-5 shadow-xl outline-none sm:p-6";

export function RecordDialog({ trigger, title, description, children }: {
  trigger: ReactNode;
  title: string;
  description: string;
  children: (controls: { close: () => void; setPending: (pending: boolean) => void }) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function restoreTriggerFocus(event: Event) {
    event.preventDefault();
    const button = triggerRef.current;
    if (!button?.isConnected || button.disabled) return;
    if (button.checkVisibility?.({ checkVisibilityCSS: true }) === false) return;

    const { activeElement, body, documentElement } = button.ownerDocument;
    // A navigation or another component may already have moved focus.
    if (activeElement && activeElement !== body && activeElement !== documentElement) return;
    button.focus({ preventScroll: true });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!pending) setOpen(next); }}>
      <Dialog.Trigger asChild ref={triggerRef}>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={overlayClass} />
        <Dialog.Content className={dialogClass} onCloseAutoFocus={restoreTriggerFocus}>
          <div className="mb-5 flex justify-between gap-3">
            <div>
              <Dialog.Title className="font-display text-xl font-extrabold text-navy">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" type="button" aria-label="Cerrar diálogo" className="shrink-0" disabled={pending}>
                <X aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>
          {children({ close: () => setOpen(false), setPending })}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
