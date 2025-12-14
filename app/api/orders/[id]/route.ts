import * as orderController from '@/src/modules/orders/orders.controller';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const result = await orderController.getOrder(params.id);
  return Response.json(result);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const result = await orderController.updateOrder(params.id, body);
  return Response.json(result);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const result = await orderController.deleteOrder(params.id);
  return Response.json(result);
}
