import * as vendorController from '@/src/modules/vendors/vendors.controller';

export async function GET() {
  const result = await vendorController.listVendors();
  return Response.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await vendorController.createVendor(body);
  return Response.json(result);
}
