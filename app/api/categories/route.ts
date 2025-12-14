import * as categoryController from '@/src/modules/categories/categories.controller';

export async function GET() {
  const result = await categoryController.listCategories();
  return Response.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await categoryController.createCategory(body);
  return Response.json(result);
}