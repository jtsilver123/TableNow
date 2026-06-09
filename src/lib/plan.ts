import { FREE_WATCH_LIMIT, type User } from "./types";

/**
 * Plan + alert copy. The product watches availability and alerts the user, who
 * books directly on Resy/OpenTable in one tap. Free members run a few watches;
 * Premium unlocks unlimited, faster checks, and the widest criteria.
 */

export const ALERT_COPY =
  "We watch the books and alert you the moment a table opens — you book it in one tap.";

export const FREE_PLAN_COPY = `Free includes ${FREE_WATCH_LIMIT} active watches. Upgrade to Premium for unlimited.`;

export const VALUE_COPY =
  "Set a wider net than Resy or OpenTable allow — date ranges, broad time windows, and flexible party sizes.";

export function isPremium(user: Pick<User, "plan">): boolean {
  return user.plan === "premium";
}

/** Can this user start another watch right now? */
export function canStartWatch(
  user: Pick<User, "plan">,
  activeWatchCount: number,
): boolean {
  return user.plan === "premium" || activeWatchCount < FREE_WATCH_LIMIT;
}
