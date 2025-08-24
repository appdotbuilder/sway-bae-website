import { db } from '../db';
import { socialMediaTable } from '../db/schema';
import { type SocialMedia } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getSocialMedia = async (): Promise<SocialMedia[]> => {
  try {
    // Fetch all active social media links ordered by display_order
    const results = await db.select()
      .from(socialMediaTable)
      .where(eq(socialMediaTable.is_active, true))
      .orderBy(asc(socialMediaTable.display_order))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch social media links:', error);
    throw error;
  }
};