"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  MIDI_SFX_PRESETS,
  type MidiSfxPresetId,
  type MidiSfxTone,
} from "@/lib/sfx/midiConfig";
import { useSettingsStore } from "@/lib/settings/store";

export type MidiSfxHandle = {
  play: () => void;
};

type MidiSfxProps = {
  presetId: MidiSfxPresetId;
};

function resolveAudioContextConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  const windowWithWebkitAudioContext = window as Window & {
    webkitAudioContext?: typeof AudioContext;
  };
  return globalThis.AudioContext ?? windowWithWebkitAudioContext.webkitAudioContext ?? null;
}

function playTone(context: AudioContext, startTime: number, tone: MidiSfxTone) {
  const gainNode = context.createGain();
  gainNode.connect(context.destination);

  const stopTime = startTime + tone.durationSeconds;
  const peakGain = Math.max(tone.peakGain, 0.0002);
  const attackEndTime = Math.min(
    startTime + tone.attackSeconds,
    stopTime - 0.001,
  );

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(
    peakGain,
    Math.max(startTime + 0.001, attackEndTime),
  );
  gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime);

  const oscillator = context.createOscillator();
  oscillator.type = tone.waveform;
  oscillator.frequency.setValueAtTime(tone.startFrequencyHz, startTime);
  if (tone.endFrequencyHz && tone.endFrequencyHz !== tone.startFrequencyHz) {
    oscillator.frequency.exponentialRampToValueAtTime(
      tone.endFrequencyHz,
      stopTime - 0.001,
    );
  }
  oscillator.connect(gainNode);
  oscillator.start(startTime);
  oscillator.stop(stopTime);
}

const MidiSfx = forwardRef<MidiSfxHandle, MidiSfxProps>(function MidiSfx(
  { presetId },
  ref,
) {
  const isSoundEnabled = useSettingsStore((state) => state.isSoundEnabled);
  const audioContextRef = useRef<AudioContext | null>(null);

  const play = useCallback(() => {
    if (!isSoundEnabled) {
      return;
    }

    const audioContextConstructor = resolveAudioContextConstructor();
    if (!audioContextConstructor) {
      return;
    }

    const context =
      audioContextRef.current ?? new audioContextConstructor();
    audioContextRef.current = context;
    if (context.state === "suspended") {
      void context.resume();
    }

    const preset = MIDI_SFX_PRESETS[presetId];
    const now = context.currentTime;
    for (const tone of preset.tones) {
      playTone(context, now + tone.startOffsetSeconds, tone);
    }
  }, [isSoundEnabled, presetId]);

  useEffect(() => {
    if (isSoundEnabled) {
      return;
    }

    const context = audioContextRef.current;
    if (!context) {
      return;
    }

    if (context.state === "running") {
      void context.suspend();
    }
  }, [isSoundEnabled]);

  useImperativeHandle(ref, () => ({ play }), [play]);

  useEffect(() => {
    return () => {
      const context = audioContextRef.current;
      if (context) {
        void context.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  return null;
});

export default MidiSfx;
