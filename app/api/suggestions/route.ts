import * as suggestionsController from '@/src/modules/suggestions/suggestions.controller';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id');

  const result = await suggestionsController.listSuggestions(userId || undefined);
  return Response.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await suggestionsController.createSuggestion(body);
  return Response.json(result);
}
