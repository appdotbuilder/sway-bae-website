import { db } from '../db';
import { siteContentTable } from '../db/schema';
import { type CreateSiteContentInput, type SiteContent } from '../schema';

export const createSiteContent = async (input: CreateSiteContentInput): Promise<SiteContent> => {
  try {
    // Insert site content record
    const result = await db.insert(siteContentTable)
      .values({
        section: input.section,
        key: input.key,
        value: input.value,
        content_type: input.content_type, // Has default applied by Zod
        is_active: input.is_active // Has default applied by Zod
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Site content creation failed:', error);
    throw error;
  }
};