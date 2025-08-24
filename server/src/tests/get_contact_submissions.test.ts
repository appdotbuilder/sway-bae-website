import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactSubmissionsTable } from '../db/schema';
import { type CreateContactSubmissionInput } from '../schema';
import { getContactSubmissions } from '../handlers/get_contact_submissions';

// Test input data
const testSubmission1: CreateContactSubmissionInput = {
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Business Inquiry',
  message: 'I would like to discuss a potential partnership opportunity.',
  ip_address: '192.168.1.1',
  user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

const testSubmission2: CreateContactSubmissionInput = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  subject: 'Fan Message',
  message: 'Love your content! Keep up the great work.',
  ip_address: '10.0.0.1',
  user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
};

const testSubmission3: CreateContactSubmissionInput = {
  name: 'Bob Wilson',
  email: 'bob@example.com',
  subject: 'Technical Question',
  message: 'What software do you use for streaming?'
  // ip_address and user_agent are optional
};

describe('getContactSubmissions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no submissions exist', async () => {
    const result = await getContactSubmissions();
    
    expect(result).toEqual([]);
  });

  it('should return all contact submissions ordered by created_at DESC', async () => {
    // Insert test submissions in sequence to ensure different timestamps
    const submission1 = await db.insert(contactSubmissionsTable)
      .values({
        name: testSubmission1.name,
        email: testSubmission1.email,
        subject: testSubmission1.subject,
        message: testSubmission1.message,
        ip_address: testSubmission1.ip_address,
        user_agent: testSubmission1.user_agent
      })
      .returning()
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const submission2 = await db.insert(contactSubmissionsTable)
      .values({
        name: testSubmission2.name,
        email: testSubmission2.email,
        subject: testSubmission2.subject,
        message: testSubmission2.message,
        ip_address: testSubmission2.ip_address,
        user_agent: testSubmission2.user_agent
      })
      .returning()
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    const submission3 = await db.insert(contactSubmissionsTable)
      .values({
        name: testSubmission3.name,
        email: testSubmission3.email,
        subject: testSubmission3.subject,
        message: testSubmission3.message,
        ip_address: testSubmission3.ip_address || null,
        user_agent: testSubmission3.user_agent || null
      })
      .returning()
      .execute();

    const result = await getContactSubmissions();

    expect(result).toHaveLength(3);

    // Verify they are ordered by created_at DESC (most recent first)
    expect(result[0].created_at.getTime()).toBeGreaterThanOrEqual(result[1].created_at.getTime());
    expect(result[1].created_at.getTime()).toBeGreaterThanOrEqual(result[2].created_at.getTime());

    // Verify the most recent submission is first (submission3)
    expect(result[0].name).toEqual('Bob Wilson');
    expect(result[0].email).toEqual('bob@example.com');
    expect(result[0].subject).toEqual('Technical Question');
    expect(result[0].message).toEqual('What software do you use for streaming?');
    expect(result[0].ip_address).toBeNull();
    expect(result[0].user_agent).toBeNull();
    expect(result[0].status).toEqual('pending'); // Default status
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Verify second submission (submission2)
    expect(result[1].name).toEqual('Jane Smith');
    expect(result[1].email).toEqual('jane@example.com');
    expect(result[1].ip_address).toEqual('10.0.0.1');

    // Verify oldest submission (submission1)
    expect(result[2].name).toEqual('John Doe');
    expect(result[2].email).toEqual('john@example.com');
    expect(result[2].ip_address).toEqual('192.168.1.1');
  });

  it('should handle submissions with different status values', async () => {
    // Insert submission with custom status
    await db.insert(contactSubmissionsTable)
      .values({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
        status: 'read'
      })
      .returning()
      .execute();

    const result = await getContactSubmissions();

    expect(result).toHaveLength(1);
    expect(result[0].status).toEqual('read');
    expect(result[0].name).toEqual('Test User');
  });

  it('should handle submissions with all nullable fields as null', async () => {
    await db.insert(contactSubmissionsTable)
      .values({
        name: 'Minimal User',
        email: 'minimal@example.com',
        subject: 'Minimal Subject',
        message: 'Minimal message',
        ip_address: null,
        user_agent: null
      })
      .returning()
      .execute();

    const result = await getContactSubmissions();

    expect(result).toHaveLength(1);
    expect(result[0].ip_address).toBeNull();
    expect(result[0].user_agent).toBeNull();
    expect(result[0].name).toEqual('Minimal User');
  });

  it('should return submissions with proper date objects', async () => {
    await db.insert(contactSubmissionsTable)
      .values({
        name: 'Date Test User',
        email: 'datetest@example.com',
        subject: 'Date Test',
        message: 'Testing date handling'
      })
      .returning()
      .execute();

    const result = await getContactSubmissions();

    expect(result).toHaveLength(1);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    expect(result[0].created_at.getTime()).toBeLessThanOrEqual(Date.now());
  });
});