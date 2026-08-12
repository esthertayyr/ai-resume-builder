"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  loadEngineState,
  loadProfile,
  nowIso,
  saveEngineState,
  saveProfile,
} from "@/lib/session/store";
import type { MasterProfile } from "@/lib/profile/types";
import { initEngine, reduce, stepNumber, type EngineAction } from "./engine";
import type { AnswerAction, EngineState, Question, Script } from "./types";

export interface UseInterview {
  ready: boolean;
  state: EngineState;
  question: Question | null;
  step: number;
  total: number;
  finished: boolean;
  submit: (action: AnswerAction, value?: unknown) => void;
  back: () => void;
  canGoBack: boolean;
}

/**
 * Drives a Script through the engine, persisting after every step so a refresh or
 * closed tab resumes exactly where the user left off. On finish, runs the script's
 * commit() to write confirmed answers into the profile as sourced facts.
 */
export function useInterview(script: Script): UseInterview {
  const [state, setState] = useState<EngineState>(() => initEngine(script));
  const [ready, setReady] = useState(false);
  const committed = useRef(false);

  // Rehydrate persisted engine state on mount (survives refresh / closed tab).
  useEffect(() => {
    const saved = loadEngineState(script.id);
    if (saved && saved.scriptId === script.id) setState(saved);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script.id]);

  // Persist after each change.
  useEffect(() => {
    if (ready) saveEngineState(state);
  }, [state, ready]);

  // Commit to the profile once, when the interview finishes.
  useEffect(() => {
    if (!ready || !state.finished || committed.current) return;
    committed.current = true;
    if (script.commit) {
      const profile: MasterProfile = loadProfile();
      saveProfile(script.commit(profile, state.answers, nowIso()));
    }
  }, [ready, state.finished, state.answers, script]);

  const dispatch = useCallback(
    (action: EngineAction) => setState((s) => reduce(s, action, script)),
    [script],
  );

  const submit = useCallback(
    (action: AnswerAction, value?: unknown) =>
      dispatch({ type: "SUBMIT", action, value, at: nowIso() }),
    [dispatch],
  );

  const back = useCallback(() => dispatch({ type: "BACK" }), [dispatch]);

  const question = useMemo(
    () => (state.currentId ? script.questions[state.currentId] : null),
    [state.currentId, script],
  );

  return {
    ready,
    state,
    question,
    step: stepNumber(state),
    total: script.totalHint,
    finished: state.finished,
    submit,
    back,
    canGoBack: state.history.length > 0,
  };
}
