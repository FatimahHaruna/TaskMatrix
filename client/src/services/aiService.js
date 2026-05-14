import { aiApi } from './api';

// Thin wrapper — swap to a real LLM by updating the server controller.
export async function suggestQuadrant(title, notes = '') {
  try {
    return await aiApi.suggest(title, notes);
  } catch {
    return null;
  }
}
