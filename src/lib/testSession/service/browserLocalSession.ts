import { createLocalTestSessionService } from "./localSession";
import {
  clearLocalTestSessionRaw,
  readLocalTestSessionRaw,
  writeLocalTestSessionRaw,
} from "@/lib/testSession/adapters/browser/localStorage";

const localTestSessionService = createLocalTestSessionService({
  clearRaw: clearLocalTestSessionRaw,
  readRaw: readLocalTestSessionRaw,
  writeRaw: writeLocalTestSessionRaw,
});

export const clearLocalTestSession =
  localTestSessionService.clearLocalTestSession;
export const consumeLocalTestSessionQueuedQuestion =
  localTestSessionService.consumeLocalTestSessionQueuedQuestion;
export const countLocalTestSessionQueuedQuestions =
  localTestSessionService.countLocalTestSessionQueuedQuestions;
export const enqueueLocalTestSessionQuestion =
  localTestSessionService.enqueueLocalTestSessionQuestion;
export const markLocalTestSessionQuestionSubmitted =
  localTestSessionService.markLocalTestSessionQuestionSubmitted;
export const readLocalTestSessionAccuracy =
  localTestSessionService.readLocalTestSessionAccuracy;
export const readLocalTestSessionProgress =
  localTestSessionService.readLocalTestSessionProgress;
export const readLocalTestSessionQuestionState =
  localTestSessionService.readLocalTestSessionQuestionState;
export const readLocalTestSessionSnapshot =
  localTestSessionService.readLocalTestSessionSnapshot;
export const shiftLocalTestSessionQuestion =
  localTestSessionService.shiftLocalTestSessionQuestion;
export const writeLocalTestSession = localTestSessionService.writeLocalTestSession;
export const writeLocalTestSessionQuestion =
  localTestSessionService.writeLocalTestSessionQuestion;
export const writeLocalTestSessionQuestionSelection =
  localTestSessionService.writeLocalTestSessionQuestionSelection;

export { calculateLocalTestSessionAccuracy } from "@/lib/testSession/core";
export type {
  LocalTestSessionAccuracy,
  LocalTestSessionQuestionEntry,
  LocalTestSessionQuestionState,
  LocalTestSessionSnapshot,
} from "@/lib/testSession/core";
export type { LocalTestSessionProgress } from "./localSession";
