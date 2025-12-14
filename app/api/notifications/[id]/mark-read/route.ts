import * as notificationsController from '@/src/modules/notifications/notifications.controller';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const result = await notificationsController.markNotificationAsRead(params.id, body);
  return Response.json(result);
}
