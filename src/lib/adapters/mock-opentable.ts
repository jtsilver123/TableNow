import type { Platform } from "../types";
import { MockPlatformAdapter } from "./mock-base";

/** Mocked OpenTable integration. Swap for a real, approved adapter later. */
export class MockOpenTableAdapter extends MockPlatformAdapter {
  readonly provider: Platform = "opentable";
}
