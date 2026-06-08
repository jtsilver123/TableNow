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
        subject: `Booked: ${ctx.restaurant}`,
        body: `Great news — we secured your table at ${ctx.restaurant}${
          ctx.date ? ` on ${ctx.date}` : ""
        }${ctx.time ? ` at ${ctx.time}` : ""}. Confirmation ${ctx.confirmation ?? ""}. A credit was used only because we booked.`,
      };
    case "request_expired":
      return {
        subject: `Your ${ctx.restaurant ?? "reservation"} request expired`,
        body: `We couldn't find a matching table before the window closed. No credit was used. You can duplicate the request to try again with broader criteria.`,
      };
    case "request_paused":
      return {
        subject: `Request paused`,
        body: `Your ${ctx.restaurant ?? "reservation"} request is paused. We won't book or use any credits until you resume it.`,
      };
    case "needs_credits":
      return {
        subject: `Add a credit to keep searching`,
        body: `Your ${ctx.restaurant ?? "reservation"} request is ready to go but needs a credit to activate. Remember, a credit is only used when we successfully book.`,
      };
    case "connection_issue":
      return {
        subject: `Reconnect your account`,
        body: `We hit a connection issue and paused your ${ctx.restaurant ?? "reservation"} request. Reconnect your account and we'll resume right away.`,
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
