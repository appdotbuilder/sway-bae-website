import { z } from 'zod';

// Social media platform schema
export const socialMediaSchema = z.object({
  id: z.number(),
  platform: z.string(), // e.g., 'twitch', 'youtube', 'tiktok', 'x', 'bluesky', 'instagram', 'discord', 'spotify'
  username: z.string(),
  url: z.string().url(),
  icon_url: z.string().url().nullable(), // Optional icon URL
  is_active: z.boolean(), // Whether to display this social link
  display_order: z.number().int(), // Order to display on the page
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type SocialMedia = z.infer<typeof socialMediaSchema>;

// Brand partnership schema
export const brandSchema = z.object({
  id: z.number(),
  name: z.string(), // e.g., 'YouTube', 'GCX', 'HelloFresh'
  logo_url: z.string().url(),
  website_url: z.string().url().nullable(), // Optional brand website
  partnership_type: z.string().nullable(), // e.g., 'sponsor', 'affiliate', 'collaboration'
  is_active: z.boolean(), // Whether to display this brand
  display_order: z.number().int(), // Order to display on the page
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Brand = z.infer<typeof brandSchema>;

// Contact form submission schema
export const contactSubmissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  subject: z.string(),
  message: z.string(),
  ip_address: z.string().nullable(), // For spam prevention
  user_agent: z.string().nullable(), // For analytics
  status: z.string(), // 'pending', 'read', 'replied', 'archived'
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;

// Site content schema for dynamic content management
export const siteContentSchema = z.object({
  id: z.number(),
  section: z.string(), // 'hero', 'about', 'merch', etc.
  key: z.string(), // specific content key within section
  value: z.string(), // the content value
  content_type: z.string(), // 'text', 'html', 'url', 'json'
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type SiteContent = z.infer<typeof siteContentSchema>;

// Input schemas for creating data
export const createSocialMediaInputSchema = z.object({
  platform: z.string().min(1),
  username: z.string().min(1),
  url: z.string().url(),
  icon_url: z.string().url().nullable().optional(),
  is_active: z.boolean().optional().default(true),
  display_order: z.number().int().nonnegative().optional().default(0)
});

export type CreateSocialMediaInput = z.infer<typeof createSocialMediaInputSchema>;

export const createBrandInputSchema = z.object({
  name: z.string().min(1),
  logo_url: z.string().url(),
  website_url: z.string().url().nullable().optional(),
  partnership_type: z.string().nullable().optional(),
  is_active: z.boolean().optional().default(true),
  display_order: z.number().int().nonnegative().optional().default(0)
});

export type CreateBrandInput = z.infer<typeof createBrandInputSchema>;

export const createContactSubmissionInputSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional()
});

export type CreateContactSubmissionInput = z.infer<typeof createContactSubmissionInputSchema>;

export const createSiteContentInputSchema = z.object({
  section: z.string().min(1),
  key: z.string().min(1),
  value: z.string(),
  content_type: z.string().optional().default('text'),
  is_active: z.boolean().optional().default(true)
});

export type CreateSiteContentInput = z.infer<typeof createSiteContentInputSchema>;

// Update schemas
export const updateSocialMediaInputSchema = z.object({
  id: z.number(),
  platform: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  url: z.string().url().optional(),
  icon_url: z.string().url().nullable().optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().nonnegative().optional()
});

export type UpdateSocialMediaInput = z.infer<typeof updateSocialMediaInputSchema>;

export const updateBrandInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  logo_url: z.string().url().optional(),
  website_url: z.string().url().nullable().optional(),
  partnership_type: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().nonnegative().optional()
});

export type UpdateBrandInput = z.infer<typeof updateBrandInputSchema>;

export const updateSiteContentInputSchema = z.object({
  id: z.number(),
  section: z.string().min(1).optional(),
  key: z.string().min(1).optional(),
  value: z.string().optional(),
  content_type: z.string().optional(),
  is_active: z.boolean().optional()
});

export type UpdateSiteContentInput = z.infer<typeof updateSiteContentInputSchema>;

// Query schemas
export const getSiteContentQuerySchema = z.object({
  section: z.string().optional(),
  is_active: z.boolean().optional()
});

export type GetSiteContentQuery = z.infer<typeof getSiteContentQuerySchema>;