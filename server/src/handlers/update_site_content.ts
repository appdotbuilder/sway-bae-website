import { db } from '../db';
import { siteContentTable } from '../db/schema';
import { type UpdateSiteContentInput, type SiteContent } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateSiteContent(input: UpdateSiteContentInput): Promise<SiteContent> {
  try {
    // First verify the site content exists
    const existingContent = await db.select()
      .from(siteContentTable)
      .where(eq(siteContentTable.id, input.id))
      .execute();

    if (existingContent.length === 0) {
      throw new Error(`Site content with id ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date() // Always update the timestamp
    };

    if (input.section !== undefined) {
      updateData.section = input.section;
    }
    if (input.key !== undefined) {
      updateData.key = input.key;
    }
    if (input.value !== undefined) {
      updateData.value = input.value;
    }
    if (input.content_type !== undefined) {
      updateData.content_type = input.content_type;
    }
    if (input.is_active !== undefined) {
      updateData.is_active = input.is_active;
    }

    // Update the site content record
    const result = await db.update(siteContentTable)
      .set(updateData)
      .where(eq(siteContentTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Site content update failed:', error);
    throw error;
  }
}