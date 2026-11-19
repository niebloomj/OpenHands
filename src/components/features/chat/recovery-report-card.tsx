import { AlertTriangle, Clock3, ListChecks } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RecoveryReport } from "#/api/conversation-service/agent-server-conversation-service.types";
import { I18nKey } from "#/i18n/declaration";

export function RecoveryReportCard({ report }: { report: RecoveryReport }) {
  const { t } = useTranslation("openhands");

  if (
    report.outcome !== "failed" &&
    report.outcome !== "stuck" &&
    report.outcome !== "interrupted_unknown"
  ) {
    return null;
  }

  return (
    <section
      aria-labelledby="recovery-report-title"
      className="mx-auto my-3 w-full max-w-3xl rounded-xl border border-border bg-surface-raised p-4 text-foreground shadow-sm"
      data-testid="recovery-report-card"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          aria-hidden
          className="mt-0.5 h-5 w-5 shrink-0 text-warning"
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 className="font-semibold" id="recovery-report-title">
              {t(I18nKey.RECOVERY_REPORT$TITLE)}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">{report.summary}</p>
          </div>

          {report.evidence_coverage === "partial" && (
            <p
              className="text-sm text-warning"
              data-testid="partial-recovery-evidence"
            >
              {t(I18nKey.RECOVERY_REPORT$PARTIAL_EVIDENCE)}
              {report.omitted_event_count !== null && (
                <span className="ml-1">
                  {t(I18nKey.RECOVERY_REPORT$OMITTED_EVENTS, {
                    count: report.omitted_event_count,
                  })}
                </span>
              )}
            </p>
          )}
          {report.evidence_coverage === "unavailable" && (
            <p
              className="text-sm text-warning"
              data-testid="unavailable-recovery-evidence"
            >
              {t(I18nKey.RECOVERY_REPORT$UNAVAILABLE_EVIDENCE)}
            </p>
          )}

          {report.last_agent_update && (
            <details className="rounded-lg bg-surface p-3">
              <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <Clock3 aria-hidden className="h-4 w-4 shrink-0" />
                {t(I18nKey.RECOVERY_REPORT$LAST_UPDATE)}
              </summary>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm">
                {report.last_agent_update.text}
              </p>
            </details>
          )}

          {report.uncertain_operations.length > 0 && (
            <div
              className="space-y-2"
              data-testid="uncertain-recovery-operations"
            >
              <h3 className="text-sm font-semibold">
                {t(I18nKey.RECOVERY_REPORT$UNCERTAIN_OPERATIONS)}
              </h3>
              <ul className="space-y-2">
                {report.uncertain_operations.map((operation) => (
                  <li
                    className="rounded-lg bg-surface p-3 text-sm"
                    key={operation.action_event_id}
                  >
                    <p className="font-medium">{operation.tool_name}</p>
                    <p className="mt-1 text-text-secondary">
                      {operation.reason}
                    </p>
                    {operation.possible_side_effects && (
                      <p className="mt-1 text-warning">
                        {t(I18nKey.RECOVERY_REPORT$POSSIBLE_SIDE_EFFECTS)}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.incomplete_tasks.length > 0 && (
            <div className="space-y-2" data-testid="incomplete-recovery-tasks">
              <h3 className="text-sm font-semibold">
                {t(I18nKey.RECOVERY_REPORT$INCOMPLETE_TASKS)}
              </h3>
              <ul className="space-y-1 text-sm">
                {report.incomplete_tasks.map((task) => (
                  <li className="flex items-start gap-2" key={task.title}>
                    <ListChecks
                      aria-hidden
                      className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary"
                    />
                    <span>
                      {task.title}{" "}
                      <span className="text-text-tertiary">
                        ({task.status})
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.recent_activity.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer font-medium">
                {t(I18nKey.RECOVERY_REPORT$RECENT_ACTIVITY)}
              </summary>
              <ol className="mt-2 space-y-1 pl-5 text-text-secondary">
                {report.recent_activity.map((activity) => (
                  <li key={activity.event_id}>{activity.label}</li>
                ))}
              </ol>
            </details>
          )}
        </div>
      </div>
    </section>
  );
}
