import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { siteContentTable } from '../db/schema';
import { type UpdateSiteContentInput, type CreateSiteContentInput } from '../schema';
import { updateSiteContent } from '../handlers/update_site_content';
import { eq } from 'drizzle-orm';

// Helper to create initial site content for testing
const createInitialContent = async (data: CreateSiteContentInput) => {
  const result = await db.insert(siteContentTable)
    .values({
      section: data.section,
      key: data.key,
      value: data.value,
      content_type: data.content_type || 'text',
      is_active: data.is_active ?? true
    })
    .returning()
    .execute();
  return result[0];
};

// Test input data
const initialContentData: CreateSiteContentInput = {
  section: 'hero',
  key: 'title',
  value: 'Welcome to StreamLabs',
  content_type: 'text',
  is_active: true
};

describe('updateSiteContent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update site content with all fields', async () => {
    // Create initial content
    const initialContent = await createInitialContent(initialContentData);
    
    const updateInput: UpdateSiteContentInput = {
      id: initialContent.id,
      section: 'about',
      key: 'description',
      value: 'Updated content description',
      content_type: 'html',
      is_active: false
    };

    const result = await updateSiteContent(updateInput);

    // Verify all fields were updated
    expect(result.id).toEqual(initialContent.id);
    expect(result.section).toEqual('about');
    expect(result.key).toEqual('description');
    expect(result.value).toEqual('Updated content description');
    expect(result.content_type).toEqual('html');
    expect(result.is_active).toEqual(false);
    expect(result.created_at).toEqual(initialContent.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(initialContent.updated_at.getTime());
  });

  it('should update only provided fields', async () => {
    // Create initial content
    const initialContent = await createInitialContent(initialContentData);
    
    const updateInput: UpdateSiteContentInput = {
      id: initialContent.id,
      value: 'Only value updated',
      is_active: false
    };

    const result = await updateSiteContent(updateInput);

    // Verify only specified fields were updated
    expect(result.id).toEqual(initialContent.id);
    expect(result.section).toEqual(initialContent.section); // Unchanged
    expect(result.key).toEqual(initialContent.key); // Unchanged
    expect(result.value).toEqual('Only value updated'); // Changed
    expect(result.content_type).toEqual(initialContent.content_type); // Unchanged
    expect(result.is_active).toEqual(false); // Changed
    expect(result.created_at).toEqual(initialContent.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(initialContent.updated_at.getTime());
  });

  it('should update content in database', async () => {
    // Create initial content
    const initialContent = await createInitialContent(initialContentData);
    
    const updateInput: UpdateSiteContentInput = {
      id: initialContent.id,
      section: 'footer',
      value: 'Updated footer content'
    };

    await updateSiteContent(updateInput);

    // Verify changes are persisted in database
    const updatedContent = await db.select()
      .from(siteContentTable)
      .where(eq(siteContentTable.id, initialContent.id))
      .execute();

    expect(updatedContent).toHaveLength(1);
    expect(updatedContent[0].section).toEqual('footer');
    expect(updatedContent[0].value).toEqual('Updated footer content');
    expect(updatedContent[0].key).toEqual(initialContent.key); // Unchanged
    expect(updatedContent[0].content_type).toEqual(initialContent.content_type); // Unchanged
    expect(updatedContent[0].updated_at).toBeInstanceOf(Date);
    expect(updatedContent[0].updated_at.getTime()).toBeGreaterThan(initialContent.updated_at.getTime());
  });

  it('should always update the updated_at timestamp', async () => {
    // Create initial content
    const initialContent = await createInitialContent(initialContentData);
    
    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const updateInput: UpdateSiteContentInput = {
      id: initialContent.id,
      // No actual content changes, just triggering update
    };

    const result = await updateSiteContent(updateInput);

    // Even with no field changes, updated_at should be newer
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(initialContent.updated_at.getTime());
  });

  it('should throw error when site content does not exist', async () => {
    const updateInput: UpdateSiteContentInput = {
      id: 99999, // Non-existent ID
      value: 'This should fail'
    };

    await expect(updateSiteContent(updateInput)).rejects.toThrow(/Site content with id 99999 not found/i);
  });

  it('should handle different content types correctly', async () => {
    // Create initial content
    const initialContent = await createInitialContent({
      ...initialContentData,
      content_type: 'json',
      value: '{"original": "data"}'
    });
    
    const updateInput: UpdateSiteContentInput = {
      id: initialContent.id,
      value: '{"updated": "data", "version": 2}',
      content_type: 'json'
    };

    const result = await updateSiteContent(updateInput);

    expect(result.value).toEqual('{"updated": "data", "version": 2}');
    expect(result.content_type).toEqual('json');
  });

  it('should handle boolean field updates correctly', async () => {
    // Create initial content that's active
    const initialContent = await createInitialContent({
      ...initialContentData,
      is_active: true
    });
    
    // Update to inactive
    const updateInput: UpdateSiteContentInput = {
      id: initialContent.id,
      is_active: false
    };

    const result = await updateSiteContent(updateInput);

    expect(result.is_active).toEqual(false);
    
    // Verify in database
    const dbContent = await db.select()
      .from(siteContentTable)
      .where(eq(siteContentTable.id, initialContent.id))
      .execute();

    expect(dbContent[0].is_active).toEqual(false);
  });
});