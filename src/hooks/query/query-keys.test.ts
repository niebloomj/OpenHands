import { describe, expect, it } from "vitest";
import { RECOVERY_REPORT_QUERY_KEYS, SETTINGS_QUERY_KEYS } from "./query-keys";

describe("SETTINGS_QUERY_KEYS", () => {
  it("returns the canonical root settings key", () => {
    expect(SETTINGS_QUERY_KEYS.all).toEqual(["settings"]);
  });

  it("builds scoped settings keys", () => {
    expect(SETTINGS_QUERY_KEYS.byScope("personal")).toEqual([
      "settings",
      "personal",
    ]);
  });

  it("builds the canonical personal settings key", () => {
    expect(SETTINGS_QUERY_KEYS.personal()).toEqual(["settings", "personal"]);
    expect(SETTINGS_QUERY_KEYS.personal()).toEqual(
      SETTINGS_QUERY_KEYS.byScope("personal"),
    );
  });
});

describe("RECOVERY_REPORT_QUERY_KEYS", () => {
  it("scopes the report by conversation, backend, organization, and runtime credentials", () => {
    expect(
      RECOVERY_REPORT_QUERY_KEYS.detail(
        "conversation-1",
        "backend-1",
        "org-1",
        "https://runtime.example.com",
        true,
        "RUNNING",
      ),
    ).toEqual([
      "conversation-recovery-report",
      "conversation-1",
      "backend-1",
      "org-1",
      "https://runtime.example.com",
      true,
      "RUNNING",
    ]);
  });
});
