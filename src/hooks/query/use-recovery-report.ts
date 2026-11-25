import { useQuery } from "@tanstack/react-query";
import EventService from "#/api/event-service/event-service.api";
import type { RecoveryReport } from "#/api/conversation-service/agent-server-conversation-service.types";
import { useActiveBackend } from "#/contexts/active-backend-context";
import { AgentState } from "#/types/agent-state";
import { RECOVERY_REPORT_QUERY_KEYS } from "./query-keys";

export function useRecoveryReport(
  conversationId: string | null | undefined,
  conversation:
    Parameters<typeof EventService.getRecoveryReport>[1] | null | undefined,
  agentState: AgentState,
): RecoveryReport | null {
  const { backend, orgId } = useActiveBackend();
  const query = useQuery({
    queryKey: RECOVERY_REPORT_QUERY_KEYS.detail(
      conversationId ?? null,
      backend.id,
      orgId,
      conversation?.conversation_url ?? null,
      Boolean(conversation?.session_api_key),
      conversation?.sandbox_status ?? null,
    ),
    queryFn: ({ signal, queryKey }) => {
      const [, id, , , conversationUrl, , sandboxStatus] = queryKey;
      if (!id) {
        throw new Error(
          "A conversation is required to load its recovery report",
        );
      }
      return EventService.getRecoveryReport(
        id,
        {
          conversation_url: conversationUrl,
          session_api_key: conversation?.session_api_key ?? null,
          sandbox_status: sandboxStatus,
        },
        signal,
      );
    },
    enabled:
      !!conversationId && !!conversation && agentState === AgentState.ERROR,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      const result = query.state.data;
      if (result?.supported === false || result?.report) return false;
      if (query.state.dataUpdateCount >= 4 || query.state.error) return false;
      return 1000;
    },
    retry: false,
    meta: { disableToast: true },
  });

  return agentState === AgentState.ERROR &&
    !query.isFetching &&
    query.data?.supported
    ? query.data.report
    : null;
}
