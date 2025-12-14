import * as vendorController from '@/src/modules/vendors/vendors.controller';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const result = await vendorController.getVendor(params.id);
  return Response.json(result);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const result = await vendorController.updateVendor(params.id, body);
  return Response.json(result);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const result = await vendorController.deleteVendor(params.id);
  return Response.json(result);
}
