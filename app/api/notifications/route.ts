import * as notificationsController from '@/src/modules/notifications/notifications.controller';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id');
  const unreadOnly = url.searchParams.get('unread_only') === 'true';

  const result = await notificationsController.listNotifications(
    userId || undefined,
    unreadOnly
  );
  return Response.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const result = await notificationsController.createNotification(body);
  return Response.json(result);
}
