import type { Answer, AnswerAction, EngineState, Script } from "./types";

export function initEngine(script: Script): EngineState {
  return {
    scriptId: script.id,
    currentId: script.start,
    history: [],
    answers: {},
    finished: false,
  };
}

export type EngineAction =
  | { type: "SUBMIT"; action: AnswerAction; value?: unknown; at: string }
  | { type: "BACK" }
  | { type: "RESET" };

export function reduce(state: EngineState, action: EngineAction, script: Script): EngineState {
  switch (action.type) {
    case "RESET":
      return initEngine(script);

    case "BACK": {
      if (state.history.length === 0) return state;
      const history = state.history.slice();
      const prev = history.pop()!;
      // Keep the recorded answer so the user can edit it; just move the cursor back.
      return { ...state, currentId: prev, history, finished: false };
    }

    case "SUBMIT": {
      if (!state.currentId) return state;
      const answer: Answer = {
        questionId: state.currentId,
        action: action.action,
        value: action.value,
        at: action.at,
      };
      const answers = { ...state.answers, [state.currentId]: answer };
      const q = script.questions[state.currentId];
      const nextId = q.next ? q.next(answer, { answers }) : defaultNext(state.currentId, script);
      return {
        ...state,
        answers,
        history: [...state.history, state.currentId],
        currentId: nextId,
        finished: nextId === null,
      };
    }

    default:
      return state;
  }
}

/** Fallback ordering when a question defines no explicit branch: insertion order. */
function defaultNext(currentId: string, script: Script): string | null {
  const ids = Object.keys(script.questions);
  const i = ids.indexOf(currentId);
  return i >= 0 && i + 1 < ids.length ? ids[i + 1] : null;
}

/** 1-based step number for "STEP x OF y". */
export function stepNumber(state: EngineState): number {
  return state.history.length + 1;
}
