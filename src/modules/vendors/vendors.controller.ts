import { createVendorSchema, updateVendorSchema } from './vendors.schema';
import * as vendorService from './vendors.service';

export async function listVendors() {
  try {
    const vendors = await vendorService.getAllVendors();
    return { success: true, data: vendors };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getVendor(id: string) {
  try {
    const vendor = await vendorService.getVendorById(id);
    if (!vendor) {
      return { success: false, error: 'Vendor not found' };
    }
    return { success: true, data: vendor };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createVendor(body: unknown) {
  try {
    const parsed = createVendorSchema.parse(body);
    const vendor = await vendorService.createVendor(parsed);
    return { success: true, data: vendor };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateVendor(id: string, body: unknown) {
  try {
    const parsed = updateVendorSchema.parse(body);
    const vendor = await vendorService.updateVendor(id, parsed);
    return { success: true, data: vendor };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteVendor(id: string) {
  try {
    await vendorService.deleteVendor(id);
    return { success: true, message: 'Vendor deleted successfully' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
