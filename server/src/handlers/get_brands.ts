import { db } from '../db';
import { brandsTable } from '../db/schema';
import { type Brand } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getBrands = async (): Promise<Brand[]> => {
  try {
    // Fetch all active brand partnerships ordered by display_order for proper rendering
    const results = await db.select()
      .from(brandsTable)
      .where(eq(brandsTable.is_active, true))
      .orderBy(asc(brandsTable.display_order))
      .execute();

    return results;
  } catch (error) {
    console.error('Brand fetching failed:', error);
    throw error;
  }
};