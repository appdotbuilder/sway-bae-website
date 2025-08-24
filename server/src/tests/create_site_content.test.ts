import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { siteContentTable } from '../db/schema';
import { type CreateSiteContentInput } from '../schema';
import { createSiteContent } from '../handlers/create_site_content';
import { eq } from 'drizzle-orm';

// Test inputs
const testInput: CreateSiteContentInput = {
  section: 'hero',
  key: 'welcome_message',
  value: 'Welcome to my streaming channel!',
  content_type: 'text',
  is_active: true
};

const minimalInput: CreateSiteContentInput = {
  section: 'about',
  key: 'bio',
  value: 'Short bio text',
  content_type: 'text', // Explicit default value
  is_active: true // Explicit default value
};

const htmlContentInput: CreateSiteContentInput = {
  section: 'merch',
  key: 'featured_item',
  value: '<div class="featured"><h3>New T-Shirt</h3><p>Limited edition design!</p></div>',
  content_type: 'html',
  is_active: true
};

describe('createSiteContent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create site content with all fields', async () => {
    const result = await createSiteContent(testInput);

    // Basic field validation
    expect(result.section).toEqual('hero');
    expect(result.key).toEqual('welcome_message');
    expect(result.value).toEqual('Welcome to my streaming channel!');
    expect(result.content_type).toEqual('text');
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create site content with default values', async () => {
    const result = await createSiteContent(minimalInput);

    // Verify defaults are applied
    expect(result.section).toEqual('about');
    expect(result.key).toEqual('bio');
    expect(result.value).toEqual('Short bio text');
    expect(result.content_type).toEqual('text'); // Default value
    expect(result.is_active).toEqual(true); // Default value
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save site content to database', async () => {
    const result = await createSiteContent(testInput);

    // Query database to verify data was saved
    const siteContent = await db.select()
      .from(siteContentTable)
      .where(eq(siteContentTable.id, result.id))
      .execute();

    expect(siteContent).toHaveLength(1);
    expect(siteContent[0].section).toEqual('hero');
    expect(siteContent[0].key).toEqual('welcome_message');
    expect(siteContent[0].value).toEqual('Welcome to my streaming channel!');
    expect(siteContent[0].content_type).toEqual('text');
    expect(siteContent[0].is_active).toEqual(true);
    expect(siteContent[0].created_at).toBeInstanceOf(Date);
    expect(siteContent[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle HTML content type correctly', async () => {
    const result = await createSiteContent(htmlContentInput);

    expect(result.section).toEqual('merch');
    expect(result.key).toEqual('featured_item');
    expect(result.value).toContain('<div class="featured">');
    expect(result.content_type).toEqual('html');
    expect(result.is_active).toEqual(true);

    // Verify in database
    const siteContent = await db.select()
      .from(siteContentTable)
      .where(eq(siteContentTable.id, result.id))
      .execute();

    expect(siteContent[0].content_type).toEqual('html');
    expect(siteContent[0].value).toContain('<div class="featured">');
  });

  it('should create multiple site content entries', async () => {
    const result1 = await createSiteContent(testInput);
    const result2 = await createSiteContent(minimalInput);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.section).toEqual('hero');
    expect(result2.section).toEqual('about');

    // Verify both exist in database
    const allSiteContent = await db.select()
      .from(siteContentTable)
      .execute();

    expect(allSiteContent).toHaveLength(2);
    expect(allSiteContent.some(sc => sc.section === 'hero')).toBe(true);
    expect(allSiteContent.some(sc => sc.section === 'about')).toBe(true);
  });

  it('should handle inactive content correctly', async () => {
    const inactiveInput: CreateSiteContentInput = {
      section: 'temp',
      key: 'temp_message',
      value: 'Temporary content',
      content_type: 'text',
      is_active: false
    };

    const result = await createSiteContent(inactiveInput);

    expect(result.is_active).toEqual(false);

    // Verify in database
    const siteContent = await db.select()
      .from(siteContentTable)
      .where(eq(siteContentTable.id, result.id))
      .execute();

    expect(siteContent[0].is_active).toEqual(false);
  });

  it('should handle different content types', async () => {
    const jsonInput: CreateSiteContentInput = {
      section: 'config',
      key: 'social_links',
      value: '{"twitter": "@streamer", "youtube": "channel123"}',
      content_type: 'json',
      is_active: true
    };

    const urlInput: CreateSiteContentInput = {
      section: 'links',
      key: 'merch_store',
      value: 'https://store.example.com',
      content_type: 'url',
      is_active: true
    };

    const jsonResult = await createSiteContent(jsonInput);
    const urlResult = await createSiteContent(urlInput);

    expect(jsonResult.content_type).toEqual('json');
    expect(jsonResult.value).toContain('twitter');

    expect(urlResult.content_type).toEqual('url');
    expect(urlResult.value).toEqual('https://store.example.com');

    // Verify in database
    const allContent = await db.select()
      .from(siteContentTable)
      .execute();

    const jsonContent = allContent.find(sc => sc.content_type === 'json');
    const urlContent = allContent.find(sc => sc.content_type === 'url');

    expect(jsonContent).toBeDefined();
    expect(urlContent).toBeDefined();
    expect(jsonContent!.value).toContain('twitter');
    expect(urlContent!.value).toEqual('https://store.example.com');
  });
});