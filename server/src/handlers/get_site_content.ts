import { db } from '../db';
import { siteContentTable } from '../db/schema';
import { type GetSiteContentQuery, type SiteContent } from '../schema';
import { eq, and, type SQL } from 'drizzle-orm';

export async function getSiteContent(query?: GetSiteContentQuery): Promise<SiteContent[]> {
  try {
    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];

    // Apply optional filters
    if (query?.section) {
      conditions.push(eq(siteContentTable.section, query.section));
    }

    if (query?.is_active !== undefined) {
      conditions.push(eq(siteContentTable.is_active, query.is_active));
    }

    // Build final query with or without where clause
    const finalQuery = conditions.length > 0
      ? db.select().from(siteContentTable).where(conditions.length === 1 ? conditions[0] : and(...conditions))
      : db.select().from(siteContentTable);

    const results = await finalQuery.execute();

    // Return results - no numeric conversions needed for this table
    return results;
  } catch (error) {
    console.error('Failed to fetch site content:', error);
    throw error;
  }
}