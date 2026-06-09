"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { resolveActivation, runWatchCheck } from "./booking-workflow";
import {
  draftToRequestDefaults,
  parseConciergeMessage,
  type ConciergeDraft,
} from "./concierge";
import {
  SEED_ATTEMPTS,
  SEED_BOOKINGS,
  SEED_REQUESTS,
  SEED_USER,
} from "./mock-data";
import { FREE_WATCH_LIMIT } from "./types";
import type {
  AppNotification,
  Booking,
  BookingAttempt,
  ConciergeMessage,
  Plan,
  ReservationRequest,
  User,
} from "./types";

/**
 * Client-side application store.
 *
 * Simulates the backend (watch monitoring + alerts) in the browser so the whole
 * product is explorable, reusing the same domain logic (watch-workflow). The
 * product watches availability and alerts; users book directly via deep links.
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
  requests: ReservationRequest[];
  attempts: BookingAttempt[];
  /** Tables our monitor found, each with a one-tap booking deep link. */
  bookings: Booking[];
  notifications: AppNotification[];
  conciergeMessages: ConciergeMessage[];
  conciergeDraft: ConciergeDraft | null;

  toasts: ToastMessage[];

  // auth / onboarding
  signup: (name: string, email: string) => void;
  login: () => void;
  logout: () => void;
  completeOnboarding: (prefs: { default_city: string; default_party_size: number }) => void;

  // watches
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

  // monitoring simulation
  runCheck: (id: string) => Promise<void>;
  runDueChecks: () => Promise<void>;

  // plan
  setPlan: (plan: Plan) => void;

  // concierge
  sendConcierge: (text: string) => void;
  clearConciergeDraft: () => void;

  // settings
  updateUser: (patch: Partial<User>) => void;
  deleteAccount: () => void;

  // helpers
  activeWatchCount: () => number;

  // toasts
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
    plan: "free",
    default_city: "New York",
    default_party_size: 2,
    created_at: iso,
    updated_at: iso,
  };
}

const seedState = () => ({
  user: structuredClone(SEED_USER),
  requests: structuredClone(SEED_REQUESTS),
  attempts: structuredClone(SEED_ATTEMPTS),
  bookings: structuredClone(SEED_BOOKINGS),
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
        set({
          authed: true,
          onboarded: false,
          user: freshUser(name, email),
          requests: [],
          attempts: [],
          bookings: [],
          notifications: [],
          conciergeMessages: [],
          conciergeDraft: null,
        });
      },

      login: () => {
        set({ authed: true, onboarded: true, ...seedState() });
      },

      logout: () => set({ authed: false }),

      completeOnboarding: ({ default_city, default_party_size }) => {
        set((s) => ({
          onboarded: true,
          user: { ...s.user, default_city, default_party_size, updated_at: nowIso() },
        }));
      },

      activeWatchCount: () => get().requests.filter((r) => r.status === "active").length,

      createRequest: (input, activate) => {
        const s = get();
        const iso = nowIso();
        const request: ReservationRequest = {
          id: uid("req"),
          user_id: s.user.id,
          restaurant_name: input.restaurant_name ?? "Untitled watch",
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
          credit_required: false,
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
          const res = resolveActivation(s.user, get().activeWatchCount());
          request.status = res.status;
          request.auto_book_enabled = res.activated;
          if (res.activated) {
            request.next_check_at = new Date(Date.now() + 30_000).toISOString();
            activated = true;
            message = "Watch started. We'll alert you the moment a table opens.";
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
        if (!request) return { activated: false, message: "Watch not found." };
        const res = resolveActivation(s.user, get().activeWatchCount());
        get().updateRequest(id, {
          status: res.status,
          auto_book_enabled: res.activated,
          next_check_at: res.activated ? new Date(Date.now() + 30_000).toISOString() : null,
        });
        return {
          activated: res.activated,
          message: res.activated
            ? "Watch started. We'll alert you the moment a table opens."
            : res.reason ?? "Could not start watch.",
        };
      },

      pauseRequest: (id) => {
        get().updateRequest(id, { status: "paused", auto_book_enabled: false, next_check_at: null });
        get().pushToast("info", "Watch paused.");
      },

      resumeRequest: (id) => {
        const res = get().activateRequest(id);
        get().pushToast(res.activated ? "success" : "warning", res.message);
      },

      cancelRequest: (id) => {
        get().updateRequest(id, { status: "canceled", auto_book_enabled: false, next_check_at: null });
        get().pushToast("info", "Watch canceled.");
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
        get().pushToast("info", "Watch duplicated as a draft.");
      },

      runCheck: async (id) => {
        const s = get();
        const request = s.requests.find((r) => r.id === id);
        if (!request || request.status !== "active") return;
        const result = await runWatchCheck({ request, user: s.user });

        set((st) => {
          const requests = st.requests.map((r) => (r.id === id ? { ...r, ...result.requestPatch } : r));
          const attempts = [result.attempt, ...st.attempts];
          const bookings = result.booking ? [result.booking, ...st.bookings] : st.bookings;
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
          return { requests, attempts, bookings, notifications };
        });

        if (result.booking) {
          get().pushToast("success", `Table found at ${request.restaurant_name}! Tap to book.`);
        }
      },

      runDueChecks: async () => {
        const due = get().requests.filter(
          (r) => r.status === "active" && r.next_check_at && new Date(r.next_check_at).getTime() <= Date.now(),
        );
        for (const r of due) {
          // eslint-disable-next-line no-await-in-loop
          await get().runCheck(r.id);
        }
      },

      setPlan: (plan) => {
        set((s) => ({ user: { ...s.user, plan, updated_at: nowIso() } }));
        if (plan === "premium") {
          // Start any watches that were blocked by the free limit.
          get()
            .requests.filter((r) => r.status === "needs_credits")
            .forEach((r) => get().activateRequest(r.id));
          get().pushToast("success", "You're on Premium — unlimited watches unlocked.");
        } else {
          get().pushToast("info", "Switched to the Free plan.");
        }
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
              reply = "Here's your watch. Review and add it whenever you're ready.";
            }
            break;
          }
          case "edit_flexibility": {
            const target = s.requests.find((r) =>
              r.restaurant_name.toLowerCase().includes(intent.restaurantHint),
            );
            if (target) {
              get().updateRequest(target.id, { flexibility_level: intent.flexibility });
              reply = `Done — I widened the search for ${target.restaurant_name} to "very flexible". That catches more openings.`;
            } else {
              reply = "Which watch should I make more flexible?";
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
              ? `Paused ${targets.length} watch${targets.length === 1 ? "" : "es"}.`
              : "I couldn't find a matching active watch to pause.";
            break;
          }
          case "explain_credits": {
            const blocked = s.requests.filter((r) => r.status === "needs_credits");
            reply =
              s.user.plan === "premium"
                ? "You're on Premium with unlimited watches — nothing is blocked."
                : blocked.length
                  ? `You're on Free (${FREE_WATCH_LIMIT} active watches). ${blocked.length} watch${
                      blocked.length === 1 ? "" : "es"
                    } need Premium to start. Upgrade for unlimited.`
                  : `You're on Free — up to ${FREE_WATCH_LIMIT} active watches. Upgrade to Premium for unlimited.`;
            break;
          }
          default: {
            reply =
              "I can create or edit table watches, make a watch easier to catch, or pause watches. Try: “Watch Don Angie for 2 next Friday after 7.”";
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

      updateUser: (patch) => set((s) => ({ user: { ...s.user, ...patch, updated_at: nowIso() } })),

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
