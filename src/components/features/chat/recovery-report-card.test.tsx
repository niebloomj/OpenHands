import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { RecoveryReport } from "#/api/conversation-service/agent-server-conversation-service.types";
import { RecoveryReportCard } from "./recovery-report-card";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, values?: { count?: number }) =>
      `${key}${values?.count === undefined ? "" : ` ${values.count}`}`,
  }),
}));

const report: RecoveryReport = {
  run_id: "run-1",
  outcome: "failed",
  reason_code: "ToolInterrupted",
  summary: "The run stopped before the operation was confirmed.",
  started_at: "2026-11-17T12:00:00Z",
  ended_at: "2026-11-17T12:01:00Z",
  error_event_id: "error-1",
  evidence_coverage: "partial",
  omitted_event_count: 3,
  last_agent_update: {
    event_id: "message-1",
    text: "I was checking the change.",
  },
  recent_activity: [
    { event_id: "action-1", kind: "ActionEvent", label: "Edited the config" },
  ],
  incomplete_tasks: [{ title: "Verify the change", status: "in_progress" }],
  uncertain_operations: [
    {
      action_event_id: "action-2",
      tool_name: "Bash",
      possible_side_effects: true,
      reason: "The command may have completed before the process stopped.",
    },
  ],
};

describe("RecoveryReportCard", () => {
  it("shows the report, uncertainty, incomplete work, and partial evidence", () => {
    render(<RecoveryReportCard report={report} />);

    expect(screen.getByTestId("recovery-report-card")).toBeInTheDocument();
    expect(screen.getByText(report.summary)).toBeInTheDocument();
    expect(screen.getByTestId("partial-recovery-evidence")).toHaveTextContent(
      "RECOVERY_REPORT$OMITTED_EVENTS 3",
    );
    expect(
      screen.getByTestId("uncertain-recovery-operations"),
    ).toHaveTextContent("Bash");
    expect(screen.getByTestId("incomplete-recovery-tasks")).toHaveTextContent(
      "Verify the change",
    );
    expect(
      screen.getByText(report.recent_activity[0].label),
    ).toBeInTheDocument();
  });

  it("does not invent an omitted-event count when the count is unknown", () => {
    render(
      <RecoveryReportCard report={{ ...report, omitted_event_count: null }} />,
    );

    const evidence = screen.getByTestId("partial-recovery-evidence");
    expect(evidence).toHaveTextContent("RECOVERY_REPORT$PARTIAL_EVIDENCE");
    expect(evidence).not.toHaveTextContent("RECOVERY_REPORT$OMITTED_EVENTS");
    expect(evidence).not.toHaveTextContent("0");
  });

  it("does not show reports for completed or resumable runs", () => {
    const { rerender } = render(
      <RecoveryReportCard report={{ ...report, outcome: "completed" }} />,
    );
    expect(
      screen.queryByTestId("recovery-report-card"),
    ).not.toBeInTheDocument();

    rerender(<RecoveryReportCard report={{ ...report, outcome: "paused" }} />);
    expect(
      screen.queryByTestId("recovery-report-card"),
    ).not.toBeInTheDocument();
  });
});
