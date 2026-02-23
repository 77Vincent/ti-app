export type MidiSfxTone = {
  startOffsetSeconds: number;
  durationSeconds: number;
  waveform: OscillatorType;
  startFrequencyHz: number;
  endFrequencyHz?: number;
  peakGain: number;
  attackSeconds: number;
};

export type MidiSfxPreset = {
  tones: readonly MidiSfxTone[];
};

export const MIDI_SFX_PRESETS = {
  optionSelect: {
    tones: [
      {
        startOffsetSeconds: 0,
        durationSeconds: 0.075,
        waveform: "square",
        startFrequencyHz: 523.25,
        endFrequencyHz: 466.16,
        peakGain: 0.032,
        attackSeconds: 0.004,
      },
    ],
  },
  submitAction: {
    tones: [
      {
        startOffsetSeconds: 0,
        durationSeconds: 0.11,
        waveform: "triangle",
        startFrequencyHz: 659.25,
        peakGain: 0.06,
        attackSeconds: 0.01,
      },
      {
        startOffsetSeconds: 0.075,
        durationSeconds: 0.13,
        waveform: "triangle",
        startFrequencyHz: 987.77,
        endFrequencyHz: 1046.5,
        peakGain: 0.068,
        attackSeconds: 0.01,
      },
    ],
  },
  difficultyUpgrade: {
    tones: [
      {
        startOffsetSeconds: 0,
        durationSeconds: 0.12,
        waveform: "triangle",
        startFrequencyHz: 880,
        peakGain: 0.055,
        attackSeconds: 0.01,
      },
      {
        startOffsetSeconds: 0.08,
        durationSeconds: 0.14,
        waveform: "triangle",
        startFrequencyHz: 1174.66,
        endFrequencyHz: 1318.51,
        peakGain: 0.062,
        attackSeconds: 0.01,
      },
    ],
  },
} as const satisfies Record<string, MidiSfxPreset>;

export type MidiSfxPresetId = keyof typeof MIDI_SFX_PRESETS;
