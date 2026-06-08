"use client";

import { create } from "zustand";
import type { ReservationRequest } from "./types";

/** Ephemeral UI state — which overlays are open. Not persisted. */
interface UiState {
  drawerRequestId: string | null;
  addModalOpen: boolean;
  addModalPrefill: Partial<ReservationRequest> | null;
  /** When set, the modal edits this request instead of creating a new one. */
  editRequestId: string | null;
  conciergeMobileOpen: boolean;

  openDrawer: (id: string) => void;
  closeDrawer: () => void;
  openAddModal: (prefill?: Partial<ReservationRequest> | null) => void;
  openEditModal: (id: string, current: Partial<ReservationRequest>) => void;
  closeAddModal: () => void;
  setConciergeMobile: (open: boolean) => void;
}

export const useUi = create<UiState>((set) => ({
  drawerRequestId: null,
  addModalOpen: false,
  addModalPrefill: null,
  editRequestId: null,
  conciergeMobileOpen: false,

  openDrawer: (id) => set({ drawerRequestId: id }),
  closeDrawer: () => set({ drawerRequestId: null }),
  openAddModal: (prefill = null) =>
    set({ addModalOpen: true, addModalPrefill: prefill, editRequestId: null }),
  openEditModal: (id, current) =>
    set({ addModalOpen: true, addModalPrefill: current, editRequestId: id, drawerRequestId: null }),
  closeAddModal: () => set({ addModalOpen: false, addModalPrefill: null, editRequestId: null }),
  setConciergeMobile: (open) => set({ conciergeMobileOpen: open }),
}));
