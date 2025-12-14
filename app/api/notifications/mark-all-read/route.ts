import * as notificationsController from '@/src/modules/notifications/notifications.controller';

export async function POST(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id');

  if (!userId) {
    return Response.json({ success: false, error: 'user_id is required' });
  }

  const result = await notificationsController.markAllNotificationsAsRead(userId);
  return Response.json(result);
}
