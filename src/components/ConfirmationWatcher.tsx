"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * While the webhook hasn't confirmed the payment, refresh the server-rendered page
 * every 2 s (max ~2 min). Also expires the Stripe session if the buyer cancelled.
 */
export function ConfirmationWatcher({ sessionId, pending, cancelled }: { sessionId: string; pending: boolean; cancelled: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (cancelled) {
      fetch("/api/checkout/cancel", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).catch(() => undefined);
    }
  }, [cancelled, sessionId]);

  useEffect(() => {
    if (!pending || cancelled) return;
    let tries = 0;
    const id = window.setInterval(async () => {
      tries++;
      try {
        const res = await fetch(`/api/orders/status?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
        const body = (await res.json()) as { status?: string };
        if (body.status && body.status !== "pending") {
          window.clearInterval(id);
          router.refresh();
        }
      } catch {
        /* keep trying */
      }
      if (tries >= 60) window.clearInterval(id);
    }, 2000);
    return () => window.clearInterval(id);
  }, [pending, cancelled, sessionId, router]);

  return null;
}
