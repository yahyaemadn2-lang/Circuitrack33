import * as productController from '@/src/modules/products/products.controller';

export async function GET() {
  const result = await productController.listProducts();
  return Response.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await productController.createProduct(body);
  return Response.json(result);
}
