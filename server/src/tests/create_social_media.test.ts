import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { socialMediaTable } from '../db/schema';
import { type CreateSocialMediaInput } from '../schema';
import { createSocialMedia } from '../handlers/create_social_media';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateSocialMediaInput = {
  platform: 'twitch',
  username: 'testuser',
  url: 'https://twitch.tv/testuser',
  icon_url: 'https://example.com/icon.png',
  is_active: true,
  display_order: 1
};

describe('createSocialMedia', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a social media link', async () => {
    const result = await createSocialMedia(testInput);

    // Basic field validation
    expect(result.platform).toEqual('twitch');
    expect(result.username).toEqual('testuser');
    expect(result.url).toEqual('https://twitch.tv/testuser');
    expect(result.icon_url).toEqual('https://example.com/icon.png');
    expect(result.is_active).toEqual(true);
    expect(result.display_order).toEqual(1);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save social media link to database', async () => {
    const result = await createSocialMedia(testInput);

    // Query using proper drizzle syntax
    const socialMediaLinks = await db.select()
      .from(socialMediaTable)
      .where(eq(socialMediaTable.id, result.id))
      .execute();

    expect(socialMediaLinks).toHaveLength(1);
    const saved = socialMediaLinks[0];
    expect(saved.platform).toEqual('twitch');
    expect(saved.username).toEqual('testuser');
    expect(saved.url).toEqual('https://twitch.tv/testuser');
    expect(saved.icon_url).toEqual('https://example.com/icon.png');
    expect(saved.is_active).toEqual(true);
    expect(saved.display_order).toEqual(1);
    expect(saved.created_at).toBeInstanceOf(Date);
    expect(saved.updated_at).toBeInstanceOf(Date);
  });

  it('should create social media link with default values', async () => {
    const minimalInput: CreateSocialMediaInput = {
      platform: 'youtube',
      username: 'youtuber',
      url: 'https://youtube.com/@youtuber',
      is_active: true,
      display_order: 0
    };

    const result = await createSocialMedia(minimalInput);

    // Check that defaults were applied correctly
    expect(result.platform).toEqual('youtube');
    expect(result.username).toEqual('youtuber');
    expect(result.url).toEqual('https://youtube.com/@youtuber');
    expect(result.icon_url).toBeNull();
    expect(result.is_active).toEqual(true);
    expect(result.display_order).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should handle null icon_url correctly', async () => {
    const inputWithNullIcon: CreateSocialMediaInput = {
      platform: 'instagram',
      username: 'instagrammer',
      url: 'https://instagram.com/instagrammer',
      icon_url: null,
      is_active: false,
      display_order: 5
    };

    const result = await createSocialMedia(inputWithNullIcon);

    expect(result.icon_url).toBeNull();
    expect(result.is_active).toEqual(false);
    expect(result.display_order).toEqual(5);
    
    // Verify in database
    const saved = await db.select()
      .from(socialMediaTable)
      .where(eq(socialMediaTable.id, result.id))
      .execute();

    expect(saved[0].icon_url).toBeNull();
    expect(saved[0].is_active).toEqual(false);
  });

  it('should create multiple social media links correctly', async () => {
    const input1: CreateSocialMediaInput = {
      platform: 'twitch',
      username: 'streamer1',
      url: 'https://twitch.tv/streamer1',
      is_active: true,
      display_order: 1
    };

    const input2: CreateSocialMediaInput = {
      platform: 'discord',
      username: 'discorduser',
      url: 'https://discord.gg/server',
      is_active: true,
      display_order: 2
    };

    const result1 = await createSocialMedia(input1);
    const result2 = await createSocialMedia(input2);

    // Ensure they have different IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.platform).toEqual('twitch');
    expect(result2.platform).toEqual('discord');
    expect(result1.display_order).toEqual(1);
    expect(result2.display_order).toEqual(2);

    // Verify both exist in database
    const allLinks = await db.select()
      .from(socialMediaTable)
      .execute();

    expect(allLinks).toHaveLength(2);
  });
});