import { createOrderSchema, updateOrderSchema } from './orders.schema';
import * as orderService from './orders.service';

export async function listOrders() {
  try {
    const orders = await orderService.getAllOrders();
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getOrder(id: string) {
  try {
    const order = await orderService.getOrderById(id);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    return { success: true, data: order };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createOrder(body: unknown) {
  try {
    const parsed = createOrderSchema.parse(body);
    const order = await orderService.createOrder(parsed);
    return { success: true, data: order };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateOrder(id: string, body: unknown) {
  try {
    const parsed = updateOrderSchema.parse(body);
    const order = await orderService.updateOrder(id, parsed);
    return { success: true, data: order };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteOrder(id: string) {
  try {
    await orderService.deleteOrder(id);
    return { success: true, message: 'Order deleted successfully' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
