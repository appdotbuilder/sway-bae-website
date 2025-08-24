import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { socialMediaTable } from '../db/schema';
import { type CreateSocialMediaInput } from '../schema';
import { getSocialMedia } from '../handlers/get_social_media';

// Test data for social media platforms
const testSocialMedia: CreateSocialMediaInput[] = [
  {
    platform: 'twitch',
    username: 'streamer1',
    url: 'https://twitch.tv/streamer1',
    icon_url: 'https://example.com/twitch.png',
    is_active: true,
    display_order: 1
  },
  {
    platform: 'youtube',
    username: 'YouTuber1',
    url: 'https://youtube.com/c/youtuber1',
    icon_url: 'https://example.com/youtube.png',
    is_active: true,
    display_order: 2
  },
  {
    platform: 'tiktok',
    username: 'tiktoker1',
    url: 'https://tiktok.com/@tiktoker1',
    icon_url: null,
    is_active: false, // Inactive - should not appear in results
    display_order: 3
  },
  {
    platform: 'instagram',
    username: 'insta1',
    url: 'https://instagram.com/insta1',
    icon_url: 'https://example.com/instagram.png',
    is_active: true,
    display_order: 0 // Should appear first due to lowest display_order
  }
];

describe('getSocialMedia', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no social media exists', async () => {
    const result = await getSocialMedia();
    expect(result).toEqual([]);
  });

  it('should return only active social media platforms', async () => {
    // Insert test data
    await db.insert(socialMediaTable)
      .values(testSocialMedia)
      .execute();

    const result = await getSocialMedia();

    // Should return only active platforms (3 out of 4)
    expect(result).toHaveLength(3);
    
    // Verify all returned items are active
    result.forEach(item => {
      expect(item.is_active).toBe(true);
    });

    // Verify inactive platform is not included
    const platforms = result.map(item => item.platform);
    expect(platforms).not.toContain('tiktok');
  });

  it('should return social media ordered by display_order ascending', async () => {
    // Insert test data
    await db.insert(socialMediaTable)
      .values(testSocialMedia)
      .execute();

    const result = await getSocialMedia();

    // Should be ordered: instagram (0), twitch (1), youtube (2)
    expect(result).toHaveLength(3);
    expect(result[0].platform).toBe('instagram');
    expect(result[0].display_order).toBe(0);
    expect(result[1].platform).toBe('twitch');
    expect(result[1].display_order).toBe(1);
    expect(result[2].platform).toBe('youtube');
    expect(result[2].display_order).toBe(2);
  });

  it('should return complete social media data with all fields', async () => {
    // Insert single test record
    await db.insert(socialMediaTable)
      .values([testSocialMedia[0]])
      .execute();

    const result = await getSocialMedia();

    expect(result).toHaveLength(1);
    const social = result[0];

    // Verify all required fields are present
    expect(social.id).toBeDefined();
    expect(typeof social.id).toBe('number');
    expect(social.platform).toBe('twitch');
    expect(social.username).toBe('streamer1');
    expect(social.url).toBe('https://twitch.tv/streamer1');
    expect(social.icon_url).toBe('https://example.com/twitch.png');
    expect(social.is_active).toBe(true);
    expect(social.display_order).toBe(1);
    expect(social.created_at).toBeInstanceOf(Date);
    expect(social.updated_at).toBeInstanceOf(Date);
  });

  it('should handle null icon_url correctly', async () => {
    const socialWithNullIcon: CreateSocialMediaInput = {
      platform: 'discord',
      username: 'discorduser',
      url: 'https://discord.gg/example',
      icon_url: null,
      is_active: true,
      display_order: 5
    };

    await db.insert(socialMediaTable)
      .values([socialWithNullIcon])
      .execute();

    const result = await getSocialMedia();

    expect(result).toHaveLength(1);
    expect(result[0].icon_url).toBeNull();
    expect(result[0].platform).toBe('discord');
  });

  it('should handle multiple social media with same display_order', async () => {
    const samePriority: CreateSocialMediaInput[] = [
      {
        platform: 'x',
        username: 'xuser1',
        url: 'https://x.com/xuser1',
        is_active: true,
        display_order: 5
      },
      {
        platform: 'bluesky',
        username: 'bskyuser1',
        url: 'https://bsky.app/profile/bskyuser1',
        is_active: true,
        display_order: 5
      }
    ];

    await db.insert(socialMediaTable)
      .values(samePriority)
      .execute();

    const result = await getSocialMedia();

    expect(result).toHaveLength(2);
    // Both should have the same display_order
    expect(result[0].display_order).toBe(5);
    expect(result[1].display_order).toBe(5);
  });
});