import { createNotificationSchema, updateNotificationSchema, markAsReadSchema } from './notifications.schema';
import * as notificationsService from './notifications.service';

export async function listNotifications(userId?: string, unreadOnly?: boolean) {
  try {
    const items = await notificationsService.getNotifications(userId, unreadOnly);
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getNotification(id: string) {
  try {
    const item = await notificationsService.getNotificationById(id);
    if (!item) {
      return { success: false, error: 'Notification not found' };
    }
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createNotification(body: unknown) {
  try {
    const parsed = createNotificationSchema.parse(body);
    const item = await notificationsService.createNotification(parsed);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateNotification(id: string, body: unknown) {
  try {
    const parsed = updateNotificationSchema.parse(body);
    const item = await notificationsService.updateNotification(id, parsed);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteNotification(id: string) {
  try {
    await notificationsService.deleteNotification(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function markNotificationAsRead(id: string, body: unknown) {
  try {
    const parsed = markAsReadSchema.parse(body);
    const item = await notificationsService.markAsRead(id, parsed.read);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const items = await notificationsService.markAllAsRead(userId);
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
