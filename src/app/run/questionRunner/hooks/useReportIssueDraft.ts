"use client";

import { useCallback, useState } from "react";

type UseReportIssueDraftInput = {
  questionId: string | null;
  isAccessBlocked: boolean;
};

type UseReportIssueDraftResult = {
  isOpen: boolean;
  text: string;
  open: () => void;
  setText: (value: string) => void;
};

export function useReportIssueDraft({
  questionId,
  isAccessBlocked,
}: UseReportIssueDraftInput): UseReportIssueDraftResult {
  const [draft, setDraft] = useState<{
    questionId: string | null;
    text: string;
    isOpen: boolean;
  }>({
    questionId: null,
    text: "",
    isOpen: false,
  });

  const open = useCallback(() => {
    if (!questionId || isAccessBlocked) {
      return;
    }

    setDraft((previousDraft) => (
      previousDraft.questionId === questionId
        ? {
          ...previousDraft,
          isOpen: true,
        }
        : {
          isOpen: true,
          questionId,
          text: "",
        }
    ));
  }, [isAccessBlocked, questionId]);

  const setText = useCallback((value: string) => {
    if (!questionId) {
      return;
    }

    setDraft({
      isOpen: true,
      questionId,
      text: value,
    });
  }, [questionId]);

  const isOpen =
    questionId !== null &&
    draft.isOpen &&
    draft.questionId === questionId;

  const text =
    questionId !== null && draft.questionId === questionId
      ? draft.text
      : "";

  return {
    isOpen,
    text,
    open,
    setText,
  };
}
