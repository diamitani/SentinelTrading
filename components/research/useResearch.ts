import { useCallback, useEffect, useRef, useState } from 'react';
import { AnswerSource, ResearchFocus, streamAnswer } from '../../services/answerEngine';

export interface ResearchStep {
  step: string;
  label: string;
}

export interface ResearchTurn {
  id: string;
  query: string;
  focus: ResearchFocus;
  status: 'streaming' | 'done' | 'error' | 'stopped';
  steps: ResearchStep[];
  sources: AnswerSource[];
  answer: string;
  related: string[];
  mode?: 'live' | 'demo';
  model?: string;
  disclosure?: string;
  complianceFlags: string[];
  error?: string;
  createdAt: number;
}

export interface ResearchThread {
  id: string;
  title: string;
  turns: ResearchTurn[];
  updatedAt: number;
}

const STORAGE_KEY = 'sentinel_research_threads_v1';
const MAX_THREADS = 30;

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function loadThreads(): ResearchThread[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ResearchThread[]) : [];
    // Anything still "streaming" from a previous visit was interrupted.
    return parsed.map((t) => ({
      ...t,
      turns: t.turns.map((turn) =>
        turn.status === 'streaming' ? { ...turn, status: 'stopped' as const } : turn
      ),
    }));
  } catch {
    return [];
  }
}

function saveThreads(threads: ResearchThread[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads.slice(0, MAX_THREADS)));
  } catch {
    /* storage full or blocked: history just won't persist */
  }
}

/**
 * Research thread state shared by the full Ask page and the floating chat.
 * Holds every thread in localStorage so history survives a refresh.
 */
export function useResearch() {
  const [threads, setThreads] = useState<ResearchThread[]>(() => loadThreads());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isStreaming) saveThreads(threads);
  }, [threads, isStreaming]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const activeThread = threads.find((t) => t.id === activeId) || null;

  const updateTurn = useCallback(
    (threadId: string, turnId: string, patch: (turn: ResearchTurn) => ResearchTurn) => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id !== threadId
            ? t
            : {
                ...t,
                updatedAt: Date.now(),
                turns: t.turns.map((turn) => (turn.id === turnId ? patch(turn) : turn)),
              }
        )
      );
    },
    []
  );

  const runTurn = useCallback(
    async (threadId: string, turn: ResearchTurn, priorTurns: ResearchTurn[]) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      const history = priorTurns
        .filter((t) => t.answer)
        .slice(-3)
        .flatMap((t) => [
          { role: 'user' as const, text: t.query },
          { role: 'model' as const, text: t.answer.slice(0, 1500) },
        ]);

      try {
        await streamAnswer(
          { query: turn.query, focus: turn.focus, history },
          (event) => {
            updateTurn(threadId, turn.id, (cur) => {
              switch (event.type) {
                case 'status':
                  return cur.steps.some((s) => s.step === event.step)
                    ? { ...cur, steps: cur.steps.map((s) => (s.step === event.step ? event : s)) }
                    : { ...cur, steps: [...cur.steps, { step: event.step, label: event.label }] };
                case 'sources':
                  return { ...cur, sources: event.sources };
                case 'answer':
                  return { ...cur, answer: event.text };
                case 'related':
                  return { ...cur, related: event.questions };
                case 'meta':
                  return {
                    ...cur,
                    mode: event.mode,
                    model: event.model,
                    disclosure: event.disclosure,
                    complianceFlags: event.complianceFlags || [],
                  };
                case 'done':
                  return { ...cur, status: 'done' };
                case 'error':
                  return { ...cur, status: 'error', error: event.message };
                default:
                  return cur;
              }
            });
          },
          controller.signal
        );
        updateTurn(threadId, turn.id, (cur) =>
          cur.status === 'streaming' ? { ...cur, status: 'done' } : cur
        );
      } catch (err: any) {
        const aborted = err?.name === 'AbortError';
        updateTurn(threadId, turn.id, (cur) => ({
          ...cur,
          status: aborted ? 'stopped' : 'error',
          error: aborted ? undefined : 'Connection lost. Check your network and try again.',
        }));
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setIsStreaming(false);
        }
      }
    },
    [updateTurn]
  );

  const ask = useCallback(
    (query: string, focus: ResearchFocus = 'all', options?: { newThread?: boolean }) => {
      const q = query.trim();
      if (!q) return;
      const turn: ResearchTurn = {
        id: uid(),
        query: q,
        focus,
        status: 'streaming',
        steps: [],
        sources: [],
        answer: '',
        related: [],
        complianceFlags: [],
        createdAt: Date.now(),
      };

      const existing = !options?.newThread ? threads.find((t) => t.id === activeId) : undefined;
      if (existing) {
        setThreads((prev) =>
          prev.map((t) =>
            t.id === existing.id ? { ...t, turns: [...t.turns, turn], updatedAt: Date.now() } : t
          )
        );
        void runTurn(existing.id, turn, existing.turns);
      } else {
        const thread: ResearchThread = {
          id: uid(),
          title: q.length > 70 ? q.slice(0, 67) + '…' : q,
          turns: [turn],
          updatedAt: Date.now(),
        };
        setThreads((prev) => [thread, ...prev].slice(0, MAX_THREADS));
        setActiveId(thread.id);
        void runTurn(thread.id, turn, []);
      }
    },
    [threads, activeId, runTurn]
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const regenerate = useCallback(
    (turnId: string) => {
      const thread = threads.find((t) => t.id === activeId);
      if (!thread) return;
      const idx = thread.turns.findIndex((t) => t.id === turnId);
      if (idx === -1) return;
      const fresh: ResearchTurn = {
        ...thread.turns[idx],
        status: 'streaming',
        steps: [],
        sources: [],
        answer: '',
        related: [],
        complianceFlags: [],
        error: undefined,
        createdAt: Date.now(),
      };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === thread.id ? { ...t, turns: t.turns.map((x) => (x.id === turnId ? fresh : x)) } : t
        )
      );
      void runTurn(thread.id, fresh, thread.turns.slice(0, idx));
    },
    [threads, activeId, runTurn]
  );

  const newThread = useCallback(() => {
    abortRef.current?.abort();
    setActiveId(null);
  }, []);

  const deleteThread = useCallback(
    (id: string) => {
      setThreads((prev) => prev.filter((t) => t.id !== id));
      if (id === activeId) setActiveId(null);
    },
    [activeId]
  );

  return {
    threads,
    activeThread,
    activeId,
    setActiveId,
    isStreaming,
    ask,
    stop,
    regenerate,
    newThread,
    deleteThread,
  };
}
