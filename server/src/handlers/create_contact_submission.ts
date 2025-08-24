import { db } from '../db';
import { contactSubmissionsTable } from '../db/schema';
import { type CreateContactSubmissionInput, type ContactSubmission } from '../schema';

export const createContactSubmission = async (input: CreateContactSubmissionInput): Promise<ContactSubmission> => {
  try {
    // Insert contact submission record
    const result = await db.insert(contactSubmissionsTable)
      .values({
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
        ip_address: input.ip_address || null,
        user_agent: input.user_agent || null,
        status: 'pending' // Default status as specified
      })
      .returning()
      .execute();

    const contactSubmission = result[0];
    return contactSubmission;
  } catch (error) {
    console.error('Contact submission creation failed:', error);
    throw error;
  }
};