"use client";

import { useEffect, useState } from "react";

/**
 * Zustand's persist middleware hydrates from localStorage on the client only.
 * This hook lets components avoid a server/client mismatch by waiting for the
 * first client render before reading persisted state.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
