import * as productController from '@/src/modules/products/products.controller';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const result = await productController.getProduct(params.id);
  return Response.json(result);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const result = await productController.updateProduct(params.id, body);
  return Response.json(result);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const result = await productController.deleteProduct(params.id);
  return Response.json(result);
}
