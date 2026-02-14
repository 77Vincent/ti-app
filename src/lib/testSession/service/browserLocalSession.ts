import { createLocalTestSessionService } from "./localSession";
import {
  clearLocalTestSessionRaw,
  readLocalTestSessionRaw,
  writeLocalTestSessionRaw,
} from "@/lib/testSession/adapters/browser/localStorage";

export const localTestSessionService = createLocalTestSessionService({
  clearRaw: clearLocalTestSessionRaw,
  readRaw: readLocalTestSessionRaw,
  writeRaw: writeLocalTestSessionRaw,
});
