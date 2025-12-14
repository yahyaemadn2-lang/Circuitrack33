import * as categoryController from '@/src/modules/categories/categories.controller';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const result = await categoryController.getCategory(params.id);
  return Response.json(result);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const result = await categoryController.updateCategory(params.id, body);
  return Response.json(result);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const result = await categoryController.deleteCategory(params.id);
  return Response.json(result);
}
