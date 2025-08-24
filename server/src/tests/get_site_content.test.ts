import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { siteContentTable } from '../db/schema';
import { type GetSiteContentQuery } from '../schema';
import { getSiteContent } from '../handlers/get_site_content';

// Test data
const testContent = [
  {
    section: 'hero',
    key: 'title',
    value: 'Welcome to My Site',
    content_type: 'text',
    is_active: true
  },
  {
    section: 'hero',
    key: 'subtitle',
    value: 'Amazing content creator',
    content_type: 'text',
    is_active: true
  },
  {
    section: 'about',
    key: 'description',
    value: 'I am a content creator who loves gaming',
    content_type: 'html',
    is_active: true
  },
  {
    section: 'about',
    key: 'bio',
    value: 'Inactive bio content',
    content_type: 'text',
    is_active: false
  },
  {
    section: 'merch',
    key: 'store_url',
    value: 'https://store.example.com',
    content_type: 'url',
    is_active: true
  }
];

describe('getSiteContent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all site content when no filters applied', async () => {
    // Insert test data
    await db.insert(siteContentTable).values(testContent).execute();

    const result = await getSiteContent();

    expect(result).toHaveLength(5);
    expect(result[0].section).toBeDefined();
    expect(result[0].key).toBeDefined();
    expect(result[0].value).toBeDefined();
    expect(result[0].content_type).toBeDefined();
    expect(result[0].is_active).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should filter by section correctly', async () => {
    await db.insert(siteContentTable).values(testContent).execute();

    const query: GetSiteContentQuery = {
      section: 'hero'
    };

    const result = await getSiteContent(query);

    expect(result).toHaveLength(2);
    result.forEach(content => {
      expect(content.section).toEqual('hero');
    });

    // Verify specific content
    const titles = result.map(r => r.key);
    expect(titles).toContain('title');
    expect(titles).toContain('subtitle');
  });

  it('should filter by is_active status correctly', async () => {
    await db.insert(siteContentTable).values(testContent).execute();

    const query: GetSiteContentQuery = {
      is_active: true
    };

    const result = await getSiteContent(query);

    expect(result).toHaveLength(4); // 4 active items
    result.forEach(content => {
      expect(content.is_active).toBe(true);
    });
  });

  it('should filter by inactive status correctly', async () => {
    await db.insert(siteContentTable).values(testContent).execute();

    const query: GetSiteContentQuery = {
      is_active: false
    };

    const result = await getSiteContent(query);

    expect(result).toHaveLength(1); // 1 inactive item
    expect(result[0].is_active).toBe(false);
    expect(result[0].key).toEqual('bio');
  });

  it('should filter by both section and is_active status', async () => {
    await db.insert(siteContentTable).values(testContent).execute();

    const query: GetSiteContentQuery = {
      section: 'about',
      is_active: true
    };

    const result = await getSiteContent(query);

    expect(result).toHaveLength(1);
    expect(result[0].section).toEqual('about');
    expect(result[0].is_active).toBe(true);
    expect(result[0].key).toEqual('description');
  });

  it('should return empty array when no matches found', async () => {
    await db.insert(siteContentTable).values(testContent).execute();

    const query: GetSiteContentQuery = {
      section: 'nonexistent'
    };

    const result = await getSiteContent(query);

    expect(result).toHaveLength(0);
  });

  it('should handle empty database', async () => {
    const result = await getSiteContent();

    expect(result).toHaveLength(0);
  });

  it('should handle different content types correctly', async () => {
    await db.insert(siteContentTable).values(testContent).execute();

    const result = await getSiteContent();

    // Check that different content types are preserved
    const contentTypes = result.map(r => r.content_type);
    expect(contentTypes).toContain('text');
    expect(contentTypes).toContain('html');
    expect(contentTypes).toContain('url');

    // Verify specific content with different types
    const htmlContent = result.find(r => r.content_type === 'html');
    expect(htmlContent).toBeDefined();
    expect(htmlContent!.value).toEqual('I am a content creator who loves gaming');

    const urlContent = result.find(r => r.content_type === 'url');
    expect(urlContent).toBeDefined();
    expect(urlContent!.value).toEqual('https://store.example.com');
  });

  it('should handle query with undefined values', async () => {
    await db.insert(siteContentTable).values(testContent).execute();

    const query: GetSiteContentQuery = {
      section: undefined,
      is_active: undefined
    };

    const result = await getSiteContent(query);

    // Should return all content since filters are undefined
    expect(result).toHaveLength(5);
  });
});