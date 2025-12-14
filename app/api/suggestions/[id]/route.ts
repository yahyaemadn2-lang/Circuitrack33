import * as suggestionsController from '@/src/modules/suggestions/suggestions.controller';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const result = await suggestionsController.getSuggestion(params.id);
  return Response.json(result);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const result = await suggestionsController.updateSuggestion(params.id, body);
  return Response.json(result);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const result = await suggestionsController.deleteSuggestion(params.id);
  return Response.json(result);
}
