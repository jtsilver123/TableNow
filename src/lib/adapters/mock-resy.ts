import type { Platform } from "../types";
import { MockPlatformAdapter } from "./mock-base";

/** Mocked Resy integration. Swap for a real, approved adapter later. */
export class MockResyAdapter extends MockPlatformAdapter {
  readonly provider: Platform = "resy";
}
