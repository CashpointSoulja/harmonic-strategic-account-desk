import { initialState } from './fixtures';
import type { DeskState } from './types';

export const STORAGE_KEY = 'harmonic-strategic-account-desk:v1';

export function load(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): DeskState {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as DeskState;
    if (parsed?.version !== 1 || !Array.isArray(parsed.campaigns)) return initialState();
    return parsed;
  } catch {
    return initialState();
  }
}

export function save(state: DeskState, storage: Pick<Storage, 'setItem'> | undefined = globalThis.localStorage) {
  try { storage?.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage full or blocked: desk keeps working in memory */ }
}

export function reset(storage: Pick<Storage, 'removeItem'> | undefined = globalThis.localStorage): DeskState {
  try { storage?.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  return initialState();
}
