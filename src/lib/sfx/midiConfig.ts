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
  submitCorrect: {
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
  submitWrong: {
    tones: [
      {
        startOffsetSeconds: 0,
        durationSeconds: 0.1,
        waveform: "sawtooth",
        startFrequencyHz: 587.33,
        endFrequencyHz: 523.25,
        peakGain: 0.07,
        attackSeconds: 0.006,
      },
      {
        startOffsetSeconds: 0.06,
        durationSeconds: 0.12,
        waveform: "square",
        startFrequencyHz: 440,
        endFrequencyHz: 349.23,
        peakGain: 0.078,
        attackSeconds: 0.006,
      },
    ],
  },
  nextAction: {
    tones: [
      {
        startOffsetSeconds: 0,
        durationSeconds: 0.09,
        waveform: "triangle",
        startFrequencyHz: 783.99,
        endFrequencyHz: 987.77,
        peakGain: 0.052,
        attackSeconds: 0.008,
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
  difficultyDowngrade: {
    tones: [
      {
        startOffsetSeconds: 0,
        durationSeconds: 0.12,
        waveform: "sawtooth",
        startFrequencyHz: 659.25,
        endFrequencyHz: 622.25,
        peakGain: 0.065,
        attackSeconds: 0.006,
      },
      {
        startOffsetSeconds: 0.08,
        durationSeconds: 0.16,
        waveform: "square",
        startFrequencyHz: 523.25,
        endFrequencyHz: 415.3,
        peakGain: 0.075,
        attackSeconds: 0.006,
      },
      {
        startOffsetSeconds: 0.18,
        durationSeconds: 0.2,
        waveform: "triangle",
        startFrequencyHz: 392,
        endFrequencyHz: 293.66,
        peakGain: 0.082,
        attackSeconds: 0.008,
      },
    ],
  },
} as const satisfies Record<string, MidiSfxPreset>;

export type MidiSfxPresetId = keyof typeof MIDI_SFX_PRESETS;
