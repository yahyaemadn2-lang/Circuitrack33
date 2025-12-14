import * as orderController from '@/src/modules/orders/orders.controller';

export async function GET() {
  const result = await orderController.listOrders();
  return Response.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await orderController.createOrder(body);
  return Response.json(result);
}
