import { db } from '../db';
import { socialMediaTable } from '../db/schema';
import { type UpdateSocialMediaInput, type SocialMedia } from '../schema';
import { eq } from 'drizzle-orm';

export const updateSocialMedia = async (input: UpdateSocialMediaInput): Promise<SocialMedia> => {
  try {
    // Check if the social media record exists
    const existing = await db.select()
      .from(socialMediaTable)
      .where(eq(socialMediaTable.id, input.id))
      .execute();

    if (existing.length === 0) {
      throw new Error(`Social media record with ID ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof socialMediaTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.platform !== undefined) {
      updateData.platform = input.platform;
    }
    if (input.username !== undefined) {
      updateData.username = input.username;
    }
    if (input.url !== undefined) {
      updateData.url = input.url;
    }
    if (input.icon_url !== undefined) {
      updateData.icon_url = input.icon_url;
    }
    if (input.is_active !== undefined) {
      updateData.is_active = input.is_active;
    }
    if (input.display_order !== undefined) {
      updateData.display_order = input.display_order;
    }

    // Update the record
    const result = await db.update(socialMediaTable)
      .set(updateData)
      .where(eq(socialMediaTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Social media update failed:', error);
    throw error;
  }
};