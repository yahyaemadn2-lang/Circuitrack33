import { createSuggestionSchema, updateSuggestionSchema } from './suggestions.schema';
import * as suggestionsService from './suggestions.service';

export async function listSuggestions(userId?: string) {
  try {
    const items = userId
      ? await suggestionsService.getSuggestionsByUserId(userId)
      : await suggestionsService.getSuggestions();
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getSuggestion(id: string) {
  try {
    const item = await suggestionsService.getSuggestionById(id);
    if (!item) {
      return { success: false, error: 'Suggestion not found' };
    }
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createSuggestion(body: unknown) {
  try {
    const parsed = createSuggestionSchema.parse(body);
    const item = await suggestionsService.addSuggestion(parsed);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateSuggestion(id: string, body: unknown) {
  try {
    const parsed = updateSuggestionSchema.parse(body);
    const item = await suggestionsService.updateSuggestion(id, parsed);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteSuggestion(id: string) {
  try {
    await suggestionsService.deleteSuggestion(id);
    return { success: true, message: 'Suggestion deleted successfully' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
