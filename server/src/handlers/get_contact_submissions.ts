import { db } from '../db';
import { contactSubmissionsTable } from '../db/schema';
import { type ContactSubmission } from '../schema';
import { desc } from 'drizzle-orm';

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  try {
    const results = await db.select()
      .from(contactSubmissionsTable)
      .orderBy(desc(contactSubmissionsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch contact submissions:', error);
    throw error;
  }
}