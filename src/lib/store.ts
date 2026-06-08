"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAdapter } from "./adapters";
import { resolveActivation, runBookingCheck } from "./booking-workflow";
import {
  draftToRequestDefaults,
  parseConciergeMessage,
  type ConciergeDraft,
} from "./concierge";
import {
  SEED_ATTEMPTS,
  SEED_BOOKINGS,
  SEED_CONNECTIONS,
  SEED_REQUESTS,
  SEED_TRANSACTIONS,
  SEED_USER,
} from "./mock-data";
import type {
  AppNotification,
  Booking,
  BookingAttempt,
  ConciergeMessage,
  ConnectedAccount,
  CreditTransaction,
  Platform,
  ReservationRequest,
  User,
} from "./types";

/**
 * Client-side application store.
 *
 * In production these mutations happen in Cloudflare Workers against D1, behind
 * a Durable Object lock (see workers/). For the MVP demo this store simulates
 * that backend in the browser so the entire product is explorable, while
 * reusing the exact same domain logic (booking-workflow, credits, adapters).
 */

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
const nowIso = () => new Date().toISOString();

export interface ToastMessage {
  id: string;
  tone: "success" | "info" | "warning";
  text: string;
}

interface AppState {
  hydrated: boolean;
  authed: boolean;
  onboarded: boolean;

  user: User;
  connections: ConnectedAccount[];
  requests: ReservationRequest[];
  attempts: BookingAttempt[];
  bookings: Booking[];
  transactions: CreditTransaction[];
  notifications: AppNotification[];
  conciergeMessages: ConciergeMessage[];
  conciergeDraft: ConciergeDraft | null;

  toasts: ToastMessage[];

  // --- auth / onboarding ---
  signup: (name: string, email: string) => void;
  login: () => void;
  logout: () => void;
  completeOnboarding: (prefs: {
    default_city: string;
    default_party_size: number;
  }) => void;

  // --- requests ---
  createRequest: (
    input: Partial<ReservationRequest>,
    activate: boolean,
  ) => { request: ReservationRequest; activated: boolean; message: string };
  updateRequest: (id: string, patch: Partial<ReservationRequest>) => void;
  activateRequest: (id: string) => { activated: boolean; message: string };
  pauseRequest: (id: string) => void;
  resumeRequest: (id: string) => void;
  cancelRequest: (id: string) => void;
  duplicateRequest: (id: string) => void;

  // --- booking simulation (queue + cron stand-in) ---
  runCheck: (id: string) => Promise<void>;
  runDueChecks: () => Promise<void>;

  // --- credits ---
  purchaseCredits: (credits: number, label: string) => void;

  // --- connections ---
  connectAccount: (provider: Platform, accountLabel?: string) => void;
  disconnectAccount: (provider: Platform) => void;
  /** Re-run the platform adapter's validateConnection and refresh health. */
  checkConnection: (provider: Platform) => Promise<void>;

  // --- concierge ---
  sendConcierge: (text: string) => void;
  clearConciergeDraft: () => void;

  // --- settings ---
  updateUser: (patch: Partial<User>) => void;
  deleteAccount: () => void;

  // --- toasts ---
  pushToast: (tone: ToastMessage["tone"], text: string) => void;
  dismissToast: (id: string) => void;

  resetDemo: () => void;
}

function freshUser(name: string, email: string): User {
  const iso = nowIso();
  return {
    id: uid("usr"),
    name,
    email,
    credit_balance: 0,
    free_credit_granted: true,
    free_credit_used: false,
    default_city: "New York",
    default_party_size: 2,
    created_at: iso,
    updated_at: iso,
  };
}

const seedState = () => ({
  user: structuredClone(SEED_USER),
  connections: structuredClone(SEED_CONNECTIONS),
  requests: structuredClone(SEED_REQUESTS),
  attempts: structuredClone(SEED_ATTEMPTS),
  bookings: structuredClone(SEED_BOOKINGS),
  transactions: structuredClone(SEED_TRANSACTIONS),
  notifications: [] as AppNotification[],
  conciergeMessages: [] as ConciergeMessage[],
  conciergeDraft: null,
});

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      authed: false,
      onboarded: false,
      toasts: [],
      ...seedState(),

      signup: (name, email) => {
        const user = freshUser(name, email);
        const iso = nowIso();
        set({
          authed: true,
          onboarded: false,
          user,
          connections: [
            {
              id: uid("con"),
              user_id: user.id,
              provider: "resy",
              status: "disconnected",
              account_label: null,
              last_checked_at: null,
              created_at: iso,
              updated_at: iso,
            },
            {
              id: uid("con"),
              user_id: user.id,
              provider: "opentable",
              status: "disconnected",
              account_label: null,
              last_checked_at: null,
              created_at: iso,
              updated_at: iso,
            },
          ],
          requests: [],
          attempts: [],
          bookings: [],
          notifications: [],
          conciergeMessages: [],
          conciergeDraft: null,
          transactions: [
            {
              id: uid("ctx"),
              user_id: user.id,
              type: "signup_bonus",
              amount: 1,
              reason: "Welcome — your first booking is free",
              booking_id: null,
              created_at: iso,
            },
          ],
        });
      },

      login: () => {
        // Demo login drops you into the seeded, returning-user experience.
        set({ authed: true, onboarded: true, ...seedState() });
      },

      logout: () => set({ authed: false }),

      completeOnboarding: ({ default_city, default_party_size }) => {
        set((s) => ({
          onboarded: true,
          user: { ...s.user, default_city, default_party_size, updated_at: nowIso() },
        }));
      },

      createRequest: (input, activate) => {
        const s = get();
        const iso = nowIso();
        const request: ReservationRequest = {
          id: uid("req"),
          user_id: s.user.id,
          restaurant_name: input.restaurant_name ?? "Untitled request",
          platform: input.platform ?? "resy",
          city: input.city ?? s.user.default_city,
          neighborhood: input.neighborhood,
          party_size: input.party_size ?? s.user.default_party_size,
          date_start: input.date_start ?? new Date().toISOString().slice(0, 10),
          date_end: input.date_end ?? input.date_start ?? new Date().toISOString().slice(0, 10),
          time_start: input.time_start ?? "19:00",
          time_end: input.time_end ?? "21:00",
          flexibility_level: input.flexibility_level ?? "flexible",
          seating_preference: input.seating_preference ?? "any",
          priority: input.priority ?? "normal",
          status: "draft",
          credit_required: true,
          auto_book_enabled: false,
          notes: input.notes ?? "",
          expires_at: (input.date_end ?? input.date_start ?? null)
            ? `${input.date_end ?? input.date_start}T23:59:00.000Z`
            : null,
          last_checked_at: null,
          next_check_at: null,
          created_at: iso,
          updated_at: iso,
        };

        let activated = false;
        let message = "Saved as a draft.";

        if (activate) {
          const conn = s.connections.find((c) => c.provider === request.platform);
          const res = resolveActivation(request, s.user, conn);
          request.status = res.status;
          request.auto_book_enabled = res.activated;
          if (res.activated) {
            request.next_check_at = new Date(Date.now() + 30_000).toISOString();
            activated = true;
            message = "Request activated. We'll book the moment a table opens.";
          } else {
            message = res.reason ?? "Saved as a draft.";
          }
        }

        set((st) => ({ requests: [request, ...st.requests] }));
        return { request, activated, message };
      },

      updateRequest: (id, patch) => {
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === id ? { ...r, ...patch, updated_at: nowIso() } : r,
          ),
        }));
      },

      activateRequest: (id) => {
        const s = get();
        const request = s.requests.find((r) => r.id === id);
        if (!request) return { activated: false, message: "Request not found." };
        const conn = s.connections.find((c) => c.provider === request.platform);
        const res = resolveActivation(request, s.user, conn);
        get().updateRequest(id, {
          status: res.status,
          auto_book_enabled: res.activated,
          next_check_at: res.activated ? new Date(Date.now() + 30_000).toISOString() : null,
        });
        return {
          activated: res.activated,
          message: res.activated
            ? "Request activated. We'll book the moment a table opens."
            : res.reason ?? "Could not activate.",
        };
      },

      pauseRequest: (id) => {
        get().updateRequest(id, { status: "paused", auto_book_enabled: false, next_check_at: null });
        get().pushToast("info", "Request paused. No credits will be used.");
      },

      resumeRequest: (id) => {
        const res = get().activateRequest(id);
        get().pushToast(res.activated ? "success" : "warning", res.message);
      },

      cancelRequest: (id) => {
        get().updateRequest(id, { status: "canceled", auto_book_enabled: false, next_check_at: null });
        get().pushToast("info", "Request canceled.");
      },

      duplicateRequest: (id) => {
        const s = get();
        const orig = s.requests.find((r) => r.id === id);
        if (!orig) return;
        const iso = nowIso();
        const copy: ReservationRequest = {
          ...orig,
          id: uid("req"),
          status: "draft",
          auto_book_enabled: false,
          last_checked_at: null,
          next_check_at: null,
          created_at: iso,
          updated_at: iso,
        };
        set((st) => ({ requests: [copy, ...st.requests] }));
        get().pushToast("info", "Request duplicated as a draft.");
      },

      runCheck: async (id) => {
        const s = get();
        const request = s.requests.find((r) => r.id === id);
        if (!request || request.status !== "active") return;
        const connection = s.connections.find((c) => c.provider === request.platform);
        const result = await runBookingCheck({ request, user: s.user, connection });

        set((st) => {
          const requests = st.requests.map((r) =>
            r.id === id ? { ...r, ...result.requestPatch } : r,
          );
          const attempts = [result.attempt, ...st.attempts];
          const bookings = result.booking ? [result.booking, ...st.bookings] : st.bookings;
          const transactions = result.creditTransaction
            ? [result.creditTransaction, ...st.transactions]
            : st.transactions;
          const user = result.userPatch ? { ...st.user, ...result.userPatch } : st.user;
          const notifications = result.notification
            ? [
                {
                  id: uid("ntf"),
                  user_id: st.user.id,
                  reservation_request_id: id,
                  type: result.notification.type,
                  channel: "email" as const,
                  status: "sent" as const,
                  sent_at: nowIso(),
                  created_at: nowIso(),
                },
                ...st.notifications,
              ]
            : st.notifications;
          return { requests, attempts, bookings, transactions, user, notifications };
        });

        if (result.booking) {
          get().pushToast("success", `Booked ${request.restaurant_name}! ${result.summary}`);
        }
      },

      runDueChecks: async () => {
        const s = get();
        const due = s.requests.filter(
          (r) => r.status === "active" && r.next_check_at && new Date(r.next_check_at).getTime() <= Date.now(),
        );
        for (const r of due) {
          // eslint-disable-next-line no-await-in-loop
          await get().runCheck(r.id);
        }
      },

      purchaseCredits: (credits, label) => {
        set((s) => ({
          user: { ...s.user, credit_balance: s.user.credit_balance + credits, updated_at: nowIso() },
          transactions: [
            {
              id: uid("ctx"),
              user_id: s.user.id,
              type: "purchase",
              amount: credits,
              reason: `Credit package — ${label}`,
              booking_id: null,
              created_at: nowIso(),
            },
            ...s.transactions,
          ],
        }));
        // Re-activate any requests that were only blocked on credits.
        const blocked = get().requests.filter((r) => r.status === "needs_credits");
        blocked.forEach((r) => get().activateRequest(r.id));
        get().pushToast("success", `${credits} credits added.`);
      },

      connectAccount: (provider, accountLabel) => {
        set((s) => ({
          connections: s.connections.map((c) =>
            c.provider === provider
              ? {
                  ...c,
                  status: "connected",
                  account_label: accountLabel ?? c.account_label ?? s.user.email,
                  last_checked_at: nowIso(),
                  updated_at: nowIso(),
                }
              : c,
          ),
        }));
        // Re-activate any requests that were waiting on this connection.
        const blocked = get().requests.filter(
          (r) => r.status === "needs_connection" && r.platform === provider,
        );
        blocked.forEach((r) => get().activateRequest(r.id));
        get().pushToast("success", `${provider === "resy" ? "Resy" : "OpenTable"} connected.`);
      },

      checkConnection: async (provider) => {
        const adapter = getAdapter(provider);
        const result = await adapter.validateConnection(get().user.id);
        set((s) => ({
          connections: s.connections.map((c) =>
            c.provider === provider
              ? {
                  ...c,
                  status: result.connected ? "connected" : "needs_reconnect",
                  last_checked_at: nowIso(),
                  updated_at: nowIso(),
                }
              : c,
          ),
        }));
        const label = provider === "resy" ? "Resy" : "OpenTable";
        get().pushToast(
          result.connected ? "success" : "warning",
          result.connected ? `${label} connection is healthy.` : `${label} needs to be reconnected.`,
        );
      },

      disconnectAccount: (provider) => {
        set((s) => ({
          connections: s.connections.map((c) =>
            c.provider === provider
              ? { ...c, status: "disconnected", account_label: null, updated_at: nowIso() }
              : c,
          ),
          // Active requests on this platform now need a connection.
          requests: s.requests.map((r) =>
            r.platform === provider && r.status === "active"
              ? { ...r, status: "needs_connection", auto_book_enabled: false, next_check_at: null }
              : r,
          ),
        }));
        get().pushToast("warning", `${provider === "resy" ? "Resy" : "OpenTable"} disconnected.`);
      },

      sendConcierge: (text) => {
        const s = get();
        const iso = nowIso();
        const userMsg: ConciergeMessage = {
          id: uid("msg"),
          user_id: s.user.id,
          role: "user",
          content: text,
          structured_payload: null,
          created_at: iso,
        };

        const intent = parseConciergeMessage(text);
        let reply = "";
        let payload: Partial<ReservationRequest> | null = null;
        let draft: ConciergeDraft | null = null;

        switch (intent.kind) {
          case "create": {
            draft = intent.draft;
            if (intent.followUp) {
              reply = intent.followUp;
            } else {
              payload = draftToRequestDefaults(intent.draft, {
                city: s.user.default_city,
                party_size: s.user.default_party_size,
              });
              reply = "Here's your request. Review and add it to your queue when ready.";
            }
            break;
          }
          case "edit_flexibility": {
            const target = s.requests.find((r) =>
              r.restaurant_name.toLowerCase().includes(intent.restaurantHint),
            );
            if (target) {
              get().updateRequest(target.id, { flexibility_level: intent.flexibility });
              reply = `Done — I widened the search for ${target.restaurant_name} to "very flexible". That improves your odds of a match.`;
            } else {
              reply = "Which request should I make more flexible?";
            }
            break;
          }
          case "pause": {
            const targets = s.requests.filter(
              (r) =>
                r.status === "active" &&
                (intent.filterHint === "all" ||
                  r.restaurant_name.toLowerCase().includes(intent.filterHint) ||
                  intent.filterHint.includes(r.restaurant_name.toLowerCase())),
            );
            targets.forEach((r) => get().pauseRequest(r.id));
            reply = targets.length
              ? `Paused ${targets.length} request${targets.length === 1 ? "" : "s"}. No credits will be used while paused.`
              : "I couldn't find a matching active request to pause.";
            break;
          }
          case "explain_credits": {
            const need = s.requests.filter((r) => r.status === "needs_credits");
            reply = need.length
              ? `${need.length} request${need.length === 1 ? "" : "s"} need credits: ${need
                  .map((r) => r.restaurant_name)
                  .join(", ")}. You have ${s.user.credit_balance} credit${
                  s.user.credit_balance === 1 ? "" : "s"
                }. Remember — a credit is only used when we successfully book.`
              : `You have ${s.user.credit_balance} credit${s.user.credit_balance === 1 ? "" : "s"} and nothing is blocked on credits right now.`;
            break;
          }
          case "explain_status": {
            reply = "Tell me which restaurant and I'll explain exactly where that request stands.";
            break;
          }
          default: {
            reply =
              "I can create or edit auto-booking requests, make a request easier to get, pause requests, or check which need credits. Try: “Book Don Angie for 2 next Friday after 7.”";
          }
        }

        const assistantMsg: ConciergeMessage = {
          id: uid("msg"),
          user_id: s.user.id,
          role: "assistant",
          content: reply,
          structured_payload: payload,
          created_at: nowIso(),
        };

        set((st) => ({
          conciergeMessages: [...st.conciergeMessages, userMsg, assistantMsg],
          conciergeDraft: draft && !payload ? draft : st.conciergeDraft,
        }));
      },

      clearConciergeDraft: () => set({ conciergeDraft: null }),

      updateUser: (patch) =>
        set((s) => ({ user: { ...s.user, ...patch, updated_at: nowIso() } })),

      deleteAccount: () => {
        set({ authed: false, onboarded: false, ...seedState() });
      },

      pushToast: (tone, text) =>
        set((s) => ({ toasts: [...s.toasts, { id: uid("toast"), tone, text }] })),

      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      resetDemo: () => set({ authed: true, onboarded: true, ...seedState() }),
    }),
    {
      name: "tablenow-store",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
