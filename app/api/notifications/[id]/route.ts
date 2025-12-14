import * as notificationsController from '@/src/modules/notifications/notifications.controller';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const result = await notificationsController.getNotification(params.id);
  return Response.json(result);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const result = await notificationsController.updateNotification(params.id, body);
  return Response.json(result);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const result = await notificationsController.deleteNotification(params.id);
  return Response.json(result);
}
