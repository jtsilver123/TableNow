import type { Platform } from "../types";
import { isLiveAvailabilityEnabled } from "../env";
import { LiveAvailabilityAdapter } from "./live";
import { MockOpenTableAdapter } from "./mock-opentable";
import { MockResyAdapter } from "./mock-resy";
import type { MockScenario, PlatformAdapter } from "./types";

export * from "./types";
export { LiveAvailabilityAdapter } from "./live";
export { MockResyAdapter } from "./mock-resy";
export { MockOpenTableAdapter } from "./mock-opentable";

/**
 * Adapter registry. The booking workflow resolves an adapter by platform and
 * never imports a concrete implementation directly — that keeps the rest of
 * the app platform-agnostic and makes real integrations a drop-in swap.
 */
export function getAdapter(platform: Platform, forcedScenario?: MockScenario): PlatformAdapter {
  if (isLiveAvailabilityEnabled && !forcedScenario) {
    return new LiveAvailabilityAdapter(platform);
  }

  switch (platform) {
    case "resy":
      return new MockResyAdapter(forcedScenario);
    case "opentable":
      return new MockOpenTableAdapter(forcedScenario);
    default: {
      const _exhaustive: never = platform;
      throw new Error(`Unknown platform: ${_exhaustive}`);
    }
  }
}
