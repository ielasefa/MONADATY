import { describe, expect, it } from "vitest";
import { createLatestRequestGuard } from "@/lib/latest-request";

describe("latest request guard", () => {
  it("prevents a slower previous search from replacing the latest result", async () => {
    const guard = createLatestRequestGuard();
    let rendered = "";
    let resolveOld!: (value: string) => void;
    let resolveNew!: (value: string) => void;
    const oldResponse = new Promise<string>((resolve) => { resolveOld = resolve; });
    const newResponse = new Promise<string>((resolve) => { resolveNew = resolve; });

    const run = async (response: Promise<string>) => {
      const requestId = guard.begin();
      const value = await response;
      if (guard.isCurrent(requestId)) rendered = value;
    };

    const oldRun = run(oldResponse);
    const newRun = run(newResponse);
    resolveNew("coca");
    await newRun;
    resolveOld("c");
    await oldRun;

    expect(rendered).toBe("coca");
  });
});
