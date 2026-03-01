import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const react = vi.hoisted(() => {
  let slots: unknown[] = [];
  let cursor = 0;
  const pendingEffects: Array<() => void> = [];

  function readSlot<T>(initializer: () => T): [number, T] {
    const index = cursor;
    cursor += 1;

    if (!(index in slots)) {
      slots[index] = initializer();
    }

    return [index, slots[index] as T];
  }

  function depsChanged(
    previous: readonly unknown[] | undefined,
    next: readonly unknown[] | undefined,
  ): boolean {
    if (!previous || !next) {
      return true;
    }
    if (previous.length !== next.length) {
      return true;
    }

    return next.some((value, index) => !Object.is(value, previous[index]));
  }

  return {
    beginRender() {
      cursor = 0;
    },
    flushEffects() {
      while (pendingEffects.length > 0) {
        const runEffect = pendingEffects.shift();
        runEffect?.();
      }
    },
    reset() {
      for (const slot of slots) {
        if (
          slot &&
          typeof slot === "object" &&
          "cleanup" in slot &&
          typeof (slot as { cleanup?: unknown }).cleanup === "function"
        ) {
          (slot as { cleanup: () => void }).cleanup();
        }
      }

      slots = [];
      cursor = 0;
      pendingEffects.length = 0;
    },
    useCallback<T extends (...args: never[]) => unknown>(
      callback: T,
      deps?: readonly unknown[],
    ): T {
      const [, callbackState] = readSlot(() => ({
        callback,
        deps: undefined as readonly unknown[] | undefined,
      }));

      if (depsChanged(callbackState.deps, deps)) {
        callbackState.callback = callback;
        callbackState.deps = deps;
      }

      return callbackState.callback as T;
    },
    useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void {
      const [, effectState] = readSlot(() => ({
        cleanup: undefined as void | (() => void),
        deps: undefined as readonly unknown[] | undefined,
      }));

      if (!depsChanged(effectState.deps, deps)) {
        return;
      }

      pendingEffects.push(() => {
        if (typeof effectState.cleanup === "function") {
          effectState.cleanup();
        }

        effectState.cleanup = effect();
        effectState.deps = deps;
      });
    },
    useState<T>(initialValue: T | (() => T)): [T, (value: T | ((previous: T) => T)) => void] {
      const [index] = readSlot(() =>
        typeof initialValue === "function"
          ? (initialValue as () => T)()
          : initialValue,
      );

      function setState(value: T | ((previous: T) => T)) {
        const previous = slots[index] as T;
        slots[index] =
          typeof value === "function"
            ? (value as (previous: T) => T)(previous)
            : value;
      }

      return [slots[index] as T, setState];
    },
  };
});

const speechEngine = vi.hoisted(() => {
  const speak = vi.fn();
  const nativeCancel = vi.fn();
  const getVoices = vi.fn(() => [] as SpeechSynthesisVoice[]);
  const synthesis = {
    speaking: false,
    speak,
    cancel: nativeCancel,
    getVoices,
  } as unknown as SpeechSynthesis;
  const setSpeaking = (nextSpeaking: boolean) => {
    (synthesis as { speaking: boolean }).speaking = nextSpeaking;
  };

  const cancel = vi.fn(() => {
    setSpeaking(false);
    nativeCancel();
  });

  const useSpeechSynthesisEngine = vi.fn(() => ({
    synthesis,
    isSpeechSupported: true,
    voices: [] as SpeechSynthesisVoice[],
    cancel,
  }));

  class MockSpeechSynthesisUtterance {
    text: string;
    lang = "";
    voice: SpeechSynthesisVoice | undefined;
    onstart: (() => void) | null = null;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor(text: string) {
      this.text = text;
    }
  }

  return {
    speak,
    nativeCancel,
    cancel,
    synthesis,
    setSpeaking,
    useSpeechSynthesisEngine,
    MockSpeechSynthesisUtterance,
  };
});

vi.mock("react", () => ({
  useCallback: react.useCallback,
  useEffect: react.useEffect,
  useState: react.useState,
}));

vi.mock("./useSpeechSynthesisEngine", () => ({
  useSpeechSynthesisEngine: speechEngine.useSpeechSynthesisEngine,
}));

import { usePromptSpeech } from "./usePromptSpeech";

type PromptSpeechInput = {
  getTextToSpeak: () => string;
  language?: string;
  cancelOnChangeKey: string;
};

function usePromptSpeechHarness(input: PromptSpeechInput) {
  react.beginRender();
  return usePromptSpeech(input);
}

describe("usePromptSpeech", () => {
  const originalWindow = (globalThis as { window?: unknown }).window;

  beforeEach(() => {
    (globalThis as { window: { SpeechSynthesisUtterance: typeof speechEngine.MockSpeechSynthesisUtterance } }).window = {
      SpeechSynthesisUtterance: speechEngine.MockSpeechSynthesisUtterance,
    };
    speechEngine.setSpeaking(false);
    speechEngine.useSpeechSynthesisEngine.mockReturnValue({
      synthesis: speechEngine.synthesis,
      isSpeechSupported: true,
      voices: [],
      cancel: speechEngine.cancel,
    });
  });

  afterEach(() => {
    react.reset();
    vi.resetAllMocks();

    if (typeof originalWindow === "undefined") {
      delete (globalThis as { window?: unknown }).window;
      return;
    }

    (globalThis as { window: unknown }).window = originalWindow;
  });

  it("calls speak on first toggle", () => {
    const hook = usePromptSpeechHarness({
      getTextToSpeak: () => "Read this prompt",
      cancelOnChangeKey: "prompt-1",
    });
    react.flushEffects();
    vi.clearAllMocks();

    hook.toggleSpeak();

    expect(speechEngine.speak).toHaveBeenCalledTimes(1);
    const [utterance] = speechEngine.speak.mock.calls[0] as [{ text: string }];
    expect(utterance.text).toBe("Read this prompt");
  });

  it("calls cancel on second toggle while speaking", () => {
    const hook = usePromptSpeechHarness({
      getTextToSpeak: () => "Read this prompt",
      cancelOnChangeKey: "prompt-1",
    });
    react.flushEffects();
    vi.clearAllMocks();

    hook.toggleSpeak();
    speechEngine.setSpeaking(true);

    hook.toggleSpeak();

    expect(speechEngine.speak).toHaveBeenCalledTimes(1);
    expect(speechEngine.cancel).toHaveBeenCalledTimes(2);
  });

  it("cancels playback when prompt key changes", () => {
    usePromptSpeechHarness({
      getTextToSpeak: () => "Prompt A",
      cancelOnChangeKey: "prompt-a",
    });
    react.flushEffects();
    vi.clearAllMocks();

    usePromptSpeechHarness({
      getTextToSpeak: () => "Prompt B",
      cancelOnChangeKey: "prompt-b",
    });
    react.flushEffects();

    expect(speechEngine.nativeCancel).toHaveBeenCalledTimes(1);
  });
});
