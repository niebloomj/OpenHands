import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import EventService from "#/api/event-service/event-service.api";
import type {
  AppConversation,
  RecoveryReport,
} from "#/api/conversation-service/agent-server-conversation-service.types";
import { ActiveBackendProvider } from "#/contexts/active-backend-context";
import { AgentState } from "#/types/agent-state";
import { useRecoveryReport } from "./use-recovery-report";

const conversation = {
  id: "conversation-1",
  conversation_url: null,
  session_api_key: null,
  sandbox_status: null,
} as AppConversation;

const report: RecoveryReport = {
  run_id: "run-1",
  outcome: "failed",
  reason_code: "RuntimeError",
  summary: "The agent stopped after an error.",
  started_at: "2026-11-15T00:00:00Z",
  ended_at: "2026-11-15T00:01:00Z",
  error_event_id: "event-1",
  evidence_coverage: "complete",
  omitted_event_count: 0,
  last_agent_update: null,
  recent_activity: [],
  incomplete_tasks: [],
  uncertain_operations: [],
};

function renderUseRecoveryReport(agentState: AgentState) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ActiveBackendProvider>{children}</ActiveBackendProvider>
    </QueryClientProvider>
  );
  return renderHook(
    () => useRecoveryReport(conversation.id, conversation, agentState),
    { wrapper },
  );
}

afterEach(() => vi.restoreAllMocks());

describe("useRecoveryReport", () => {
  it("loads a report only after the conversation enters an error state", async () => {
    const getRecoveryReport = vi
      .spyOn(EventService, "getRecoveryReport")
      .mockResolvedValue({ supported: true, report });

    const { result } = renderUseRecoveryReport(AgentState.FINISHED);
    expect(result.current).toBeNull();
    expect(getRecoveryReport).not.toHaveBeenCalled();

    const failedRun = renderUseRecoveryReport(AgentState.ERROR);
    await waitFor(() => expect(failedRun.result.current).toEqual(report));
    expect(getRecoveryReport).toHaveBeenCalledTimes(1);
  });

  it("hides the previous report when a new run starts", async () => {
    const nextReport = {
      ...report,
      run_id: "run-2",
      summary: "The retry stopped.",
    };
    let resolveNextReport!: (value: {
      supported: true;
      report: RecoveryReport;
    }) => void;
    const getRecoveryReport = vi
      .spyOn(EventService, "getRecoveryReport")
      .mockResolvedValueOnce({ supported: true, report })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveNextReport = resolve;
          }),
      );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ActiveBackendProvider>{children}</ActiveBackendProvider>
      </QueryClientProvider>
    );

    const { result, rerender } = renderHook(
      ({ state }: { state: AgentState }) =>
        useRecoveryReport(conversation.id, conversation, state),
      { initialProps: { state: AgentState.ERROR }, wrapper },
    );
    await waitFor(() => expect(result.current).toEqual(report));

    rerender({ state: AgentState.RUNNING });
    expect(result.current).toBeNull();

    rerender({ state: AgentState.ERROR });
    await waitFor(() => expect(getRecoveryReport).toHaveBeenCalledTimes(2));
    expect(result.current).toBeNull();

    resolveNextReport({ supported: true, report: nextReport });
    await waitFor(() => expect(result.current).toEqual(nextReport));
  });
});
