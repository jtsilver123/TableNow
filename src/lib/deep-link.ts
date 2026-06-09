import type { Platform, ReservationRequest } from "./types";

/**
 * Build a one-tap deep link to the platform's booking page for a found opening.
 *
 * OpenTable supports a reliable search URL. Resy uses city/venue slugs, so we
 * build a best-effort venue URL. In production the availability adapter returns
 * the exact booking URL; this is the fallback used with the mock monitor.
 */

const RESY_CITY_SLUGS: Record<string, string> = {
  "new york": "ny",
  "los angeles": "la",
  chicago: "chi",
  "san francisco": "sf",
  miami: "miami",
  austin: "austin",
  boston: "boston",
  "washington dc": "dc",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function bookingDeepLink(
  req: Pick<ReservationRequest, "platform" | "restaurant_name" | "city" | "party_size" | "date_start" | "time_start">,
): string {
  const seats = req.party_size;
  const date = req.date_start;
  const time = req.time_start || "19:00";

  if (req.platform === "opentable") {
    const params = new URLSearchParams({
      term: req.restaurant_name,
      covers: String(seats),
      dateTime: `${date}T${time}`,
    });
    return `https://www.opentable.com/s?${params.toString()}`;
  }

  // Resy
  const citySlug = RESY_CITY_SLUGS[req.city.trim().toLowerCase()] ?? slugify(req.city);
  const venueSlug = slugify(req.restaurant_name);
  const params = new URLSearchParams({ date, seats: String(seats) });
  return `https://resy.com/cities/${citySlug}/venues/${venueSlug}?${params.toString()}`;
}
