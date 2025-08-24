import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { socialMediaTable } from '../db/schema';
import { type UpdateSocialMediaInput, type CreateSocialMediaInput } from '../schema';
import { updateSocialMedia } from '../handlers/update_social_media';
import { eq } from 'drizzle-orm';

// Helper to create initial social media record
const createInitialRecord = async (): Promise<number> => {
  const initialData: CreateSocialMediaInput = {
    platform: 'twitch',
    username: 'testuser',
    url: 'https://twitch.tv/testuser',
    icon_url: 'https://example.com/icon.png',
    is_active: true,
    display_order: 1
  };

  const result = await db.insert(socialMediaTable)
    .values({
      platform: initialData.platform,
      username: initialData.username,
      url: initialData.url,
      icon_url: initialData.icon_url,
      is_active: initialData.is_active,
      display_order: initialData.display_order
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updateSocialMedia', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update social media platform', async () => {
    const recordId = await createInitialRecord();

    const updateInput: UpdateSocialMediaInput = {
      id: recordId,
      platform: 'youtube'
    };

    const result = await updateSocialMedia(updateInput);

    expect(result.id).toEqual(recordId);
    expect(result.platform).toEqual('youtube');
    expect(result.username).toEqual('testuser'); // Unchanged
    expect(result.url).toEqual('https://twitch.tv/testuser'); // Unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update username and url together', async () => {
    const recordId = await createInitialRecord();

    const updateInput: UpdateSocialMediaInput = {
      id: recordId,
      username: 'newuser',
      url: 'https://youtube.com/@newuser'
    };

    const result = await updateSocialMedia(updateInput);

    expect(result.id).toEqual(recordId);
    expect(result.platform).toEqual('twitch'); // Unchanged
    expect(result.username).toEqual('newuser');
    expect(result.url).toEqual('https://youtube.com/@newuser');
  });

  it('should update icon_url to null', async () => {
    const recordId = await createInitialRecord();

    const updateInput: UpdateSocialMediaInput = {
      id: recordId,
      icon_url: null
    };

    const result = await updateSocialMedia(updateInput);

    expect(result.id).toEqual(recordId);
    expect(result.icon_url).toBeNull();
    expect(result.platform).toEqual('twitch'); // Unchanged
  });

  it('should update is_active status', async () => {
    const recordId = await createInitialRecord();

    const updateInput: UpdateSocialMediaInput = {
      id: recordId,
      is_active: false
    };

    const result = await updateSocialMedia(updateInput);

    expect(result.id).toEqual(recordId);
    expect(result.is_active).toEqual(false);
    expect(result.display_order).toEqual(1); // Unchanged
  });

  it('should update display_order', async () => {
    const recordId = await createInitialRecord();

    const updateInput: UpdateSocialMediaInput = {
      id: recordId,
      display_order: 5
    };

    const result = await updateSocialMedia(updateInput);

    expect(result.id).toEqual(recordId);
    expect(result.display_order).toEqual(5);
    expect(result.is_active).toEqual(true); // Unchanged
  });

  it('should update all fields at once', async () => {
    const recordId = await createInitialRecord();

    const updateInput: UpdateSocialMediaInput = {
      id: recordId,
      platform: 'tiktok',
      username: 'tiktoker',
      url: 'https://tiktok.com/@tiktoker',
      icon_url: 'https://example.com/tiktok-icon.png',
      is_active: false,
      display_order: 10
    };

    const result = await updateSocialMedia(updateInput);

    expect(result.id).toEqual(recordId);
    expect(result.platform).toEqual('tiktok');
    expect(result.username).toEqual('tiktoker');
    expect(result.url).toEqual('https://tiktok.com/@tiktoker');
    expect(result.icon_url).toEqual('https://example.com/tiktok-icon.png');
    expect(result.is_active).toEqual(false);
    expect(result.display_order).toEqual(10);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated data to database', async () => {
    const recordId = await createInitialRecord();

    const updateInput: UpdateSocialMediaInput = {
      id: recordId,
      platform: 'instagram',
      username: 'instauser'
    };

    await updateSocialMedia(updateInput);

    // Verify data was persisted
    const records = await db.select()
      .from(socialMediaTable)
      .where(eq(socialMediaTable.id, recordId))
      .execute();

    expect(records).toHaveLength(1);
    const record = records[0];
    expect(record.platform).toEqual('instagram');
    expect(record.username).toEqual('instauser');
    expect(record.url).toEqual('https://twitch.tv/testuser'); // Unchanged
    expect(record.updated_at).toBeInstanceOf(Date);
  });

  it('should update updated_at timestamp automatically', async () => {
    const recordId = await createInitialRecord();

    // Get original updated_at
    const originalRecord = await db.select()
      .from(socialMediaTable)
      .where(eq(socialMediaTable.id, recordId))
      .execute();
    
    const originalUpdatedAt = originalRecord[0].updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateSocialMediaInput = {
      id: recordId,
      platform: 'discord'
    };

    const result = await updateSocialMedia(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should throw error for non-existent social media ID', async () => {
    const updateInput: UpdateSocialMediaInput = {
      id: 99999,
      platform: 'youtube'
    };

    await expect(updateSocialMedia(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle partial updates correctly', async () => {
    const recordId = await createInitialRecord();

    // Update only one field
    const updateInput: UpdateSocialMediaInput = {
      id: recordId,
      display_order: 3
    };

    const result = await updateSocialMedia(updateInput);

    // Verify only specified field changed
    expect(result.display_order).toEqual(3);
    expect(result.platform).toEqual('twitch'); // Original value
    expect(result.username).toEqual('testuser'); // Original value
    expect(result.is_active).toEqual(true); // Original value
  });
});