import type { Platform } from "./types";

/**
 * Curated directory of hard-to-get restaurants used to power the typeahead in
 * onboarding and the add-request flow. In production this would be backed by a
 * searchable restaurant index (cached in KV / a Supabase table); here it's a
 * lightweight, recognizable seed list.
 */
export interface RestaurantEntry {
  name: string;
  city: string;
  neighborhood: string;
  platform: Platform;
}

export const RESTAURANTS: RestaurantEntry[] = [
  // New York
  { name: "Don Angie", city: "New York", neighborhood: "West Village", platform: "resy" },
  { name: "Tatiana", city: "New York", neighborhood: "Lincoln Center", platform: "resy" },
  { name: "Cote", city: "New York", neighborhood: "Flatiron", platform: "opentable" },
  { name: "Lilia", city: "New York", neighborhood: "Williamsburg", platform: "resy" },
  { name: "Carbone", city: "New York", neighborhood: "Greenwich Village", platform: "resy" },
  { name: "Rezdora", city: "New York", neighborhood: "Flatiron", platform: "resy" },
  { name: "I Sodi", city: "New York", neighborhood: "West Village", platform: "resy" },
  { name: "4 Charles Prime Rib", city: "New York", neighborhood: "West Village", platform: "resy" },
  { name: "Torrisi", city: "New York", neighborhood: "Nolita", platform: "resy" },
  { name: "The River Café", city: "New York", neighborhood: "Brooklyn Heights", platform: "opentable" },
  { name: "Semma", city: "New York", neighborhood: "West Village", platform: "resy" },
  { name: "Le Bernardin", city: "New York", neighborhood: "Midtown", platform: "opentable" },
  { name: "Via Carota", city: "New York", neighborhood: "West Village", platform: "resy" },
  { name: "Raoul's", city: "New York", neighborhood: "SoHo", platform: "resy" },
  // Los Angeles
  { name: "Bestia", city: "Los Angeles", neighborhood: "Arts District", platform: "resy" },
  { name: "Providence", city: "Los Angeles", neighborhood: "Hollywood", platform: "opentable" },
  { name: "Felix Trattoria", city: "Los Angeles", neighborhood: "Venice", platform: "resy" },
  { name: "Gjelina", city: "Los Angeles", neighborhood: "Venice", platform: "resy" },
  // Chicago
  { name: "Alinea", city: "Chicago", neighborhood: "Lincoln Park", platform: "opentable" },
  { name: "Girl & the Goat", city: "Chicago", neighborhood: "West Loop", platform: "opentable" },
  { name: "Kasama", city: "Chicago", neighborhood: "Ukrainian Village", platform: "resy" },
  // San Francisco
  { name: "State Bird Provisions", city: "San Francisco", neighborhood: "Fillmore", platform: "resy" },
  { name: "Zuni Café", city: "San Francisco", neighborhood: "Hayes Valley", platform: "opentable" },
  { name: "House of Prime Rib", city: "San Francisco", neighborhood: "Polk Gulch", platform: "opentable" },
  // Miami
  { name: "Carbone Miami", city: "Miami", neighborhood: "South Beach", platform: "resy" },
  { name: "Boia De", city: "Miami", neighborhood: "Buena Vista", platform: "resy" },
  // Austin
  { name: "Uchi", city: "Austin", neighborhood: "South Lamar", platform: "opentable" },
  { name: "Franklin Barbecue", city: "Austin", neighborhood: "East Austin", platform: "resy" },
];

/** Case-insensitive prefix/substring search, ranked: prefix matches first. */
export function searchRestaurants(query: string, limit = 6): RestaurantEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = RESTAURANTS.map((r) => {
    const name = r.name.toLowerCase();
    let score = -1;
    if (name.startsWith(q)) score = 0;
    else if (name.includes(q)) score = 1;
    else if (`${r.city} ${r.neighborhood}`.toLowerCase().includes(q)) score = 2;
    return { r, score };
  }).filter((x) => x.score >= 0);
  scored.sort((a, b) => a.score - b.score || a.r.name.localeCompare(b.r.name));
  return scored.slice(0, limit).map((x) => x.r);
}
