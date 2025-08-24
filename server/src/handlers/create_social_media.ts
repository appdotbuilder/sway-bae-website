import { db } from '../db';
import { socialMediaTable } from '../db/schema';
import { type CreateSocialMediaInput, type SocialMedia } from '../schema';

export const createSocialMedia = async (input: CreateSocialMediaInput): Promise<SocialMedia> => {
  try {
    // Insert social media record
    const result = await db.insert(socialMediaTable)
      .values({
        platform: input.platform,
        username: input.username,
        url: input.url,
        icon_url: input.icon_url || null,
        is_active: input.is_active ?? true,
        display_order: input.display_order ?? 0
      })
      .returning()
      .execute();

    // Return the created social media record
    return result[0];
  } catch (error) {
    console.error('Social media creation failed:', error);
    throw error;
  }
};