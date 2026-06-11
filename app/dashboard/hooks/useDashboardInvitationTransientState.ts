import { useCallback, useRef, useState } from 'react';

import type { InvitationVisibilityResult } from '@/app/dashboard/types';
import type { DashboardPendingInvitation } from '@/shared/constants/dashboardPendingInvitation';

import type { InvitationResultMap } from './dashboardInvitationState';

type DeleteStateMap = Record<string, boolean>;
type DeleteErrorMap = Record<string, string | null>;
type GuestReadinessStateMap = Record<string, boolean>;
type ShareStateMap = Record<string, boolean>;
type VisibilityStateMap = Record<string, boolean>;
type VisibilityErrorMap = Record<string, string | null>;

export function useDashboardInvitationTransientState(
  initialResults: InvitationResultMap
) {
  // 카드별 busy/error/result와 polling abort controller를 한 곳에 모아
  // 메인 hook이 액션 흐름만 다루도록 분리한다.
  const [deleteBusy, setDeleteBusy] = useState<DeleteStateMap>({});
  const [deleteErrors, setDeleteErrors] = useState<DeleteErrorMap>({});
  const [readinessPolling, setReadinessPolling] =
    useState<GuestReadinessStateMap>({});
  const [shareBusy, setShareBusy] = useState<ShareStateMap>({});
  const [visibilityBusy, setVisibilityBusy] = useState<VisibilityStateMap>({});
  const [visibilityErrors, setVisibilityErrors] = useState<VisibilityErrorMap>(
    {}
  );
  const [invitationResults, setInvitationResults] =
    useState<InvitationResultMap>(initialResults);

  const readinessAbortControllersRef = useRef(
    new Map<string, AbortController>()
  );
  const pendingInvitationRef = useRef<DashboardPendingInvitation | null>(null);
  const pendingInvitationAbortControllerRef = useRef<AbortController | null>(
    null
  );
  const hasAppliedPendingInvitationRef = useRef(false);

  const abortReadinessPolling = useCallback((folderId: string) => {
    const controller = readinessAbortControllersRef.current.get(folderId);
    controller?.abort();
    readinessAbortControllersRef.current.delete(folderId);
  }, []);

  const abortAllReadinessPolling = useCallback(() => {
    readinessAbortControllersRef.current.forEach(controller => {
      controller.abort();
    });
    readinessAbortControllersRef.current.clear();
  }, []);

  const abortPendingInvitationPolling = useCallback(() => {
    pendingInvitationAbortControllerRef.current?.abort();
    pendingInvitationAbortControllerRef.current = null;
  }, []);

  const resetInvitationResultState = useCallback(() => {
    abortAllReadinessPolling();
    setVisibilityBusy({});
    setVisibilityErrors({});
    setReadinessPolling({});
    setInvitationResults({});
  }, [abortAllReadinessPolling]);

  const clearInvitationTransientState = useCallback(
    (folderId: string) => {
      abortReadinessPolling(folderId);
      if (pendingInvitationRef.current?.invitationFolderId === folderId) {
        pendingInvitationRef.current = null;
        abortPendingInvitationPolling();
      }

      setDeleteBusy(prev => omitKey(prev, folderId));
      setDeleteErrors(prev => omitKey(prev, folderId));
      setReadinessPolling(prev => omitKey(prev, folderId));
      setShareBusy(prev => omitKey(prev, folderId));
      setVisibilityBusy(prev => omitKey(prev, folderId));
      setVisibilityErrors(prev => omitKey(prev, folderId));
      setInvitationResults(prev => omitKey(prev, folderId));
    },
    [abortPendingInvitationPolling, abortReadinessPolling]
  );

  return {
    deleteBusy,
    setDeleteBusy,
    deleteErrors,
    setDeleteErrors,
    readinessPolling,
    setReadinessPolling,
    shareBusy,
    setShareBusy,
    visibilityBusy,
    setVisibilityBusy,
    visibilityErrors,
    setVisibilityErrors,
    invitationResults,
    setInvitationResults,
    readinessAbortControllersRef,
    pendingInvitationRef,
    pendingInvitationAbortControllerRef,
    hasAppliedPendingInvitationRef,
    abortReadinessPolling,
    abortAllReadinessPolling,
    abortPendingInvitationPolling,
    resetInvitationResultState,
    clearInvitationTransientState,
  };
}

function omitKey<T>(value: Record<string, T>, key: string) {
  const next = { ...value };
  delete next[key];
  return next;
}
