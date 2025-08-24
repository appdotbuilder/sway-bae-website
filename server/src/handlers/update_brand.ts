import { db } from '../db';
import { brandsTable } from '../db/schema';
import { type UpdateBrandInput, type Brand } from '../schema';
import { eq } from 'drizzle-orm';

export const updateBrand = async (input: UpdateBrandInput): Promise<Brand> => {
  try {
    // First, verify the brand exists
    const existingBrand = await db.select()
      .from(brandsTable)
      .where(eq(brandsTable.id, input.id))
      .limit(1)
      .execute();

    if (existingBrand.length === 0) {
      throw new Error(`Brand with id ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof brandsTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.logo_url !== undefined) {
      updateData.logo_url = input.logo_url;
    }

    if (input.website_url !== undefined) {
      updateData.website_url = input.website_url;
    }

    if (input.partnership_type !== undefined) {
      updateData.partnership_type = input.partnership_type;
    }

    if (input.is_active !== undefined) {
      updateData.is_active = input.is_active;
    }

    if (input.display_order !== undefined) {
      updateData.display_order = input.display_order;
    }

    // Update the brand record
    const result = await db.update(brandsTable)
      .set(updateData)
      .where(eq(brandsTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Brand update failed:', error);
    throw error;
  }
};