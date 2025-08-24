import { serial, text, pgTable, timestamp, boolean, integer, varchar } from 'drizzle-orm/pg-core';

// Social media platforms table
export const socialMediaTable = pgTable('social_media', {
  id: serial('id').primaryKey(),
  platform: varchar('platform', { length: 50 }).notNull(), // twitch, youtube, tiktok, etc.
  username: varchar('username', { length: 100 }).notNull(),
  url: text('url').notNull(),
  icon_url: text('icon_url'), // Nullable - can store custom icon URLs
  is_active: boolean('is_active').notNull().default(true),
  display_order: integer('display_order').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Brand partnerships table
export const brandsTable = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(), // YouTube, GCX, HelloFresh, etc.
  logo_url: text('logo_url').notNull(),
  website_url: text('website_url'), // Nullable - optional brand website
  partnership_type: varchar('partnership_type', { length: 50 }), // Nullable - sponsor, affiliate, etc.
  is_active: boolean('is_active').notNull().default(true),
  display_order: integer('display_order').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Contact form submissions table
export const contactSubmissionsTable = pgTable('contact_submissions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 200 }).notNull(),
  message: text('message').notNull(),
  ip_address: varchar('ip_address', { length: 45 }), // Nullable - IPv4/IPv6 support
  user_agent: text('user_agent'), // Nullable - for analytics
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, read, replied, archived
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Site content management table for dynamic content
export const siteContentTable = pgTable('site_content', {
  id: serial('id').primaryKey(),
  section: varchar('section', { length: 50 }).notNull(), // hero, about, merch, etc.
  key: varchar('key', { length: 100 }).notNull(), // specific content identifier
  value: text('value').notNull(), // the actual content
  content_type: varchar('content_type', { length: 20 }).notNull().default('text'), // text, html, url, json
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schemas
export type SocialMedia = typeof socialMediaTable.$inferSelect;
export type NewSocialMedia = typeof socialMediaTable.$inferInsert;

export type Brand = typeof brandsTable.$inferSelect;
export type NewBrand = typeof brandsTable.$inferInsert;

export type ContactSubmission = typeof contactSubmissionsTable.$inferSelect;
export type NewContactSubmission = typeof contactSubmissionsTable.$inferInsert;

export type SiteContent = typeof siteContentTable.$inferSelect;
export type NewSiteContent = typeof siteContentTable.$inferInsert;

// Export all tables for proper query building and relations
export const tables = {
  socialMedia: socialMediaTable,
  brands: brandsTable,
  contactSubmissions: contactSubmissionsTable,
  siteContent: siteContentTable
};