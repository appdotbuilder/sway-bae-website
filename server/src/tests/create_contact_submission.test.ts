import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactSubmissionsTable } from '../db/schema';
import { type CreateContactSubmissionInput } from '../schema';
import { createContactSubmission } from '../handlers/create_contact_submission';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateContactSubmissionInput = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  subject: 'Test Subject',
  message: 'This is a test message for contact submission.',
  ip_address: '192.168.1.1',
  user_agent: 'Mozilla/5.0 (Test Browser)'
};

describe('createContactSubmission', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a contact submission with all fields', async () => {
    const result = await createContactSubmission(testInput);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.subject).toEqual('Test Subject');
    expect(result.message).toEqual('This is a test message for contact submission.');
    expect(result.ip_address).toEqual('192.168.1.1');
    expect(result.user_agent).toEqual('Mozilla/5.0 (Test Browser)');
    expect(result.status).toEqual('pending');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a contact submission with minimal fields', async () => {
    const minimalInput: CreateContactSubmissionInput = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      subject: 'Minimal Test',
      message: 'Short message'
    };

    const result = await createContactSubmission(minimalInput);

    expect(result.name).toEqual('Jane Smith');
    expect(result.email).toEqual('jane@example.com');
    expect(result.subject).toEqual('Minimal Test');
    expect(result.message).toEqual('Short message');
    expect(result.ip_address).toBeNull();
    expect(result.user_agent).toBeNull();
    expect(result.status).toEqual('pending');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save contact submission to database', async () => {
    const result = await createContactSubmission(testInput);

    // Query using proper drizzle syntax
    const submissions = await db.select()
      .from(contactSubmissionsTable)
      .where(eq(contactSubmissionsTable.id, result.id))
      .execute();

    expect(submissions).toHaveLength(1);
    expect(submissions[0].name).toEqual('John Doe');
    expect(submissions[0].email).toEqual('john.doe@example.com');
    expect(submissions[0].subject).toEqual('Test Subject');
    expect(submissions[0].message).toEqual('This is a test message for contact submission.');
    expect(submissions[0].ip_address).toEqual('192.168.1.1');
    expect(submissions[0].user_agent).toEqual('Mozilla/5.0 (Test Browser)');
    expect(submissions[0].status).toEqual('pending');
    expect(submissions[0].created_at).toBeInstanceOf(Date);
    expect(submissions[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle long messages correctly', async () => {
    const longMessage = 'A'.repeat(2000); // Maximum allowed length
    const longInput: CreateContactSubmissionInput = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Long Message Test',
      message: longMessage
    };

    const result = await createContactSubmission(longInput);

    expect(result.message).toEqual(longMessage);
    expect(result.message.length).toEqual(2000);
  });

  it('should handle special characters in input fields', async () => {
    const specialInput: CreateContactSubmissionInput = {
      name: 'José María',
      email: 'jose.maria@español.com',
      subject: 'Testing éñ spëcîál çhárãctèrs',
      message: 'This message contains special characters: áéíóú ñ ç €'
    };

    const result = await createContactSubmission(specialInput);

    expect(result.name).toEqual('José María');
    expect(result.email).toEqual('jose.maria@español.com');
    expect(result.subject).toEqual('Testing éñ spëcîál çhárãctèrs');
    expect(result.message).toEqual('This message contains special characters: áéíóú ñ ç €');
  });

  it('should set default status to pending', async () => {
    const result = await createContactSubmission(testInput);

    expect(result.status).toEqual('pending');

    // Verify in database too
    const submissions = await db.select()
      .from(contactSubmissionsTable)
      .where(eq(contactSubmissionsTable.id, result.id))
      .execute();

    expect(submissions[0].status).toEqual('pending');
  });

  it('should set created_at and updated_at timestamps', async () => {
    const beforeSubmission = new Date();
    const result = await createContactSubmission(testInput);
    const afterSubmission = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeSubmission.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterSubmission.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeSubmission.getTime());
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterSubmission.getTime());
  });
});