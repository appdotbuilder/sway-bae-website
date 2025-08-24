import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { brandsTable } from '../db/schema';
import { type UpdateBrandInput, type CreateBrandInput } from '../schema';
import { updateBrand } from '../handlers/update_brand';
import { eq } from 'drizzle-orm';

// Helper function to create a test brand
const createTestBrand = async (overrides?: Partial<CreateBrandInput>) => {
  const brandData = {
    name: 'Test Brand',
    logo_url: 'https://example.com/logo.png',
    website_url: 'https://example.com',
    partnership_type: 'sponsor',
    is_active: true,
    display_order: 1,
    ...overrides
  };

  const result = await db.insert(brandsTable)
    .values(brandData)
    .returning()
    .execute();

  return result[0];
};

describe('updateBrand', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a brand with all fields', async () => {
    // Create test brand
    const testBrand = await createTestBrand();
    const originalUpdatedAt = testBrand.updated_at;

    // Wait a bit to ensure updated_at changes
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateBrandInput = {
      id: testBrand.id,
      name: 'Updated Brand',
      logo_url: 'https://updated.com/logo.png',
      website_url: 'https://updated.com',
      partnership_type: 'affiliate',
      is_active: false,
      display_order: 5
    };

    const result = await updateBrand(updateInput);

    // Verify all fields were updated
    expect(result.id).toEqual(testBrand.id);
    expect(result.name).toEqual('Updated Brand');
    expect(result.logo_url).toEqual('https://updated.com/logo.png');
    expect(result.website_url).toEqual('https://updated.com');
    expect(result.partnership_type).toEqual('affiliate');
    expect(result.is_active).toEqual(false);
    expect(result.display_order).toEqual(5);
    expect(result.created_at).toEqual(testBrand.created_at);
    expect(result.updated_at).not.toEqual(originalUpdatedAt);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    // Create test brand
    const testBrand = await createTestBrand({
      name: 'Original Brand',
      logo_url: 'https://original.com/logo.png',
      website_url: 'https://original.com',
      partnership_type: 'sponsor',
      is_active: true,
      display_order: 1
    });

    const updateInput: UpdateBrandInput = {
      id: testBrand.id,
      name: 'Partially Updated Brand',
      is_active: false
    };

    const result = await updateBrand(updateInput);

    // Verify only specified fields were updated
    expect(result.name).toEqual('Partially Updated Brand');
    expect(result.is_active).toEqual(false);
    // Other fields should remain unchanged
    expect(result.logo_url).toEqual('https://original.com/logo.png');
    expect(result.website_url).toEqual('https://original.com');
    expect(result.partnership_type).toEqual('sponsor');
    expect(result.display_order).toEqual(1);
  });

  it('should update nullable fields to null', async () => {
    // Create test brand with values
    const testBrand = await createTestBrand({
      website_url: 'https://original.com',
      partnership_type: 'sponsor'
    });

    const updateInput: UpdateBrandInput = {
      id: testBrand.id,
      website_url: null,
      partnership_type: null
    };

    const result = await updateBrand(updateInput);

    expect(result.website_url).toBeNull();
    expect(result.partnership_type).toBeNull();
    // Other fields should remain unchanged
    expect(result.name).toEqual(testBrand.name);
    expect(result.logo_url).toEqual(testBrand.logo_url);
  });

  it('should save updated brand to database', async () => {
    // Create test brand
    const testBrand = await createTestBrand();

    const updateInput: UpdateBrandInput = {
      id: testBrand.id,
      name: 'Database Updated Brand',
      display_order: 10
    };

    await updateBrand(updateInput);

    // Verify database was updated
    const brands = await db.select()
      .from(brandsTable)
      .where(eq(brandsTable.id, testBrand.id))
      .execute();

    expect(brands).toHaveLength(1);
    expect(brands[0].name).toEqual('Database Updated Brand');
    expect(brands[0].display_order).toEqual(10);
  });

  it('should automatically update the updated_at timestamp', async () => {
    // Create test brand
    const testBrand = await createTestBrand();
    const originalUpdatedAt = testBrand.updated_at;

    // Wait to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateBrandInput = {
      id: testBrand.id,
      name: 'Timestamp Test Brand'
    };

    const result = await updateBrand(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    expect(result.created_at).toEqual(testBrand.created_at);
  });

  it('should throw error when brand does not exist', async () => {
    const updateInput: UpdateBrandInput = {
      id: 999999, // Non-existent ID
      name: 'Non-existent Brand'
    };

    await expect(updateBrand(updateInput)).rejects.toThrow(/Brand with id 999999 not found/i);
  });

  it('should handle zero display_order correctly', async () => {
    // Create test brand
    const testBrand = await createTestBrand({ display_order: 5 });

    const updateInput: UpdateBrandInput = {
      id: testBrand.id,
      display_order: 0
    };

    const result = await updateBrand(updateInput);

    expect(result.display_order).toEqual(0);
  });

  it('should preserve original created_at timestamp', async () => {
    // Create test brand
    const testBrand = await createTestBrand();
    const originalCreatedAt = testBrand.created_at;

    const updateInput: UpdateBrandInput = {
      id: testBrand.id,
      name: 'Preserve Created At Test'
    };

    const result = await updateBrand(updateInput);

    expect(result.created_at).toEqual(originalCreatedAt);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should handle boolean field updates correctly', async () => {
    // Create test brand that's active
    const testBrand = await createTestBrand({ is_active: true });

    const updateInput: UpdateBrandInput = {
      id: testBrand.id,
      is_active: false
    };

    const result = await updateBrand(updateInput);

    expect(result.is_active).toEqual(false);
    expect(typeof result.is_active).toEqual('boolean');
  });
});