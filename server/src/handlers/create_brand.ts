import { db } from '../db';
import { brandsTable } from '../db/schema';
import { type CreateBrandInput, type Brand } from '../schema';

export const createBrand = async (input: CreateBrandInput): Promise<Brand> => {
  try {
    // Insert brand record
    const result = await db.insert(brandsTable)
      .values({
        name: input.name,
        logo_url: input.logo_url,
        website_url: input.website_url || null,
        partnership_type: input.partnership_type || null,
        is_active: input.is_active ?? true, // Use Zod default if not provided
        display_order: input.display_order ?? 0 // Use Zod default if not provided
      })
      .returning()
      .execute();

    // Return the created brand
    const brand = result[0];
    return brand;
  } catch (error) {
    console.error('Brand creation failed:', error);
    throw error;
  }
};