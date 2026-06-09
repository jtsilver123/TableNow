import type { NotificationType } from "@/lib/types";

/**
 * Transactional email integration (Resend) — stubbed for the MVP.
 *
 * `notificationEmail` builds the copy for each notification type; `sendEmail`
 * is a no-op that logs unless RESEND_API_KEY is set, at which point you swap in
 * the Resend SDK. SMS is intentionally out of scope for now.
 */

export interface EmailContent {
  subject: string;
  body: string;
}

export function notificationEmail(
  type: NotificationType,
  ctx: { restaurant?: string; date?: string; time?: string; confirmation?: string },
): EmailContent {
  switch (type) {
    case "booking_success":
      return {
        subject: `A table opened at ${ctx.restaurant}`,
        body: `Good news — a table just opened at ${ctx.restaurant}${
          ctx.date ? ` on ${ctx.date}` : ""
        }${ctx.time ? ` at ${ctx.time}` : ""}. Tap the link in the app to book it on your own account before it's gone.`,
      };
    case "request_expired":
      return {
        subject: `Your ${ctx.restaurant ?? "table"} watch expired`,
        body: `We couldn't find a matching table before your window closed. You can duplicate the watch to try again with broader criteria.`,
      };
    case "request_paused":
      return {
        subject: `Watch paused`,
        body: `Your ${ctx.restaurant ?? "table"} watch is paused. We'll stop checking until you resume it.`,
      };
    case "needs_credits":
      return {
        subject: `Upgrade to start this watch`,
        body: `Your ${ctx.restaurant ?? "table"} watch is ready, but you've reached your free watch limit. Upgrade to Premium for unlimited watches.`,
      };
    case "connection_issue":
      return {
        subject: `Watch needs attention`,
        body: `We hit a snag checking your ${ctx.restaurant ?? "table"} watch. Open the app to take a look.`,
      };
  }
}

export async function sendEmail(to: string, content: EmailContent): Promise<{ sent: boolean }> {
  if (!process.env.RESEND_API_KEY) {
    // Demo mode — no email is actually sent.
    return { sent: false };
  }
  // TODO: integrate Resend once RESEND_API_KEY is configured.
  //   const resend = new Resend(process.env.RESEND_API_KEY);
  //   await resend.emails.send({ from, to, subject, html });
  return { sent: true };
}
