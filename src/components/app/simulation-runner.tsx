"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

/**
 * Client-side stand-in for Cloudflare Cron Triggers + Queues.
 *
 * Every few seconds it asks the store to run any booking checks that are due
 * (active requests whose next_check_at has passed). In production this is a
 * scheduled Worker enqueueing jobs — here it keeps the demo feeling alive so
 * you can watch a request go from "Searching" to "Booked".
 */
export function SimulationRunner() {
  const runDueChecks = useStore((s) => s.runDueChecks);

  useEffect(() => {
    const tick = () => void runDueChecks();
    tick();
    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  }, [runDueChecks]);

  return null;
}
