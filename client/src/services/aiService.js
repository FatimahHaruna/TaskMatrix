import { aiApi } from './api';

export async function suggestQuadrant(title, notes = '') {
  try {
    return await aiApi.suggest(title, notes);
  } catch {
    return null;
  }
}

export async function suggestSubtasks(title, notes = '') {
  try {
    const res = await aiApi.subtasks(title, notes);
    return res.subtasks || [];
  } catch {
    return [];
  }
}
