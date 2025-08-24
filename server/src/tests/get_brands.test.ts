import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { brandsTable } from '../db/schema';
import { type CreateBrandInput } from '../schema';
import { getBrands } from '../handlers/get_brands';

// Test brand data
const testBrand1: CreateBrandInput = {
  name: 'YouTube',
  logo_url: 'https://example.com/youtube-logo.png',
  website_url: 'https://youtube.com',
  partnership_type: 'sponsor',
  is_active: true,
  display_order: 1
};

const testBrand2: CreateBrandInput = {
  name: 'GCX',
  logo_url: 'https://example.com/gcx-logo.png',
  website_url: 'https://gcx.com',
  partnership_type: 'affiliate',
  is_active: true,
  display_order: 0
};

const testBrand3: CreateBrandInput = {
  name: 'HelloFresh',
  logo_url: 'https://example.com/hellofresh-logo.png',
  website_url: null,
  partnership_type: 'collaboration',
  is_active: false, // Inactive brand
  display_order: 2
};

describe('getBrands', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no brands exist', async () => {
    const result = await getBrands();
    expect(result).toEqual([]);
  });

  it('should return all active brands ordered by display_order', async () => {
    // Insert test brands in random order
    await db.insert(brandsTable)
      .values([
        testBrand1, // display_order: 1
        testBrand3, // display_order: 2, inactive
        testBrand2  // display_order: 0
      ])
      .execute();

    const result = await getBrands();

    // Should return only active brands (2 out of 3)
    expect(result).toHaveLength(2);
    
    // Should be ordered by display_order (0, 1)
    expect(result[0].name).toEqual('GCX');
    expect(result[0].display_order).toEqual(0);
    expect(result[1].name).toEqual('YouTube');
    expect(result[1].display_order).toEqual(1);
  });

  it('should exclude inactive brands', async () => {
    // Insert only inactive brand
    await db.insert(brandsTable)
      .values([testBrand3])
      .execute();

    const result = await getBrands();
    expect(result).toHaveLength(0);
  });

  it('should return brands with all required fields', async () => {
    await db.insert(brandsTable)
      .values([testBrand1])
      .execute();

    const result = await getBrands();
    
    expect(result).toHaveLength(1);
    const brand = result[0];
    
    // Verify all fields are present and correctly typed
    expect(brand.id).toBeDefined();
    expect(typeof brand.id).toBe('number');
    expect(brand.name).toEqual('YouTube');
    expect(brand.logo_url).toEqual('https://example.com/youtube-logo.png');
    expect(brand.website_url).toEqual('https://youtube.com');
    expect(brand.partnership_type).toEqual('sponsor');
    expect(brand.is_active).toEqual(true);
    expect(brand.display_order).toEqual(1);
    expect(brand.created_at).toBeInstanceOf(Date);
    expect(brand.updated_at).toBeInstanceOf(Date);
  });

  it('should handle nullable fields correctly', async () => {
    const brandWithNulls: CreateBrandInput = {
      name: 'Test Brand',
      logo_url: 'https://example.com/test-logo.png',
      website_url: null,
      partnership_type: null,
      is_active: true,
      display_order: 0
    };

    await db.insert(brandsTable)
      .values([brandWithNulls])
      .execute();

    const result = await getBrands();
    
    expect(result).toHaveLength(1);
    const brand = result[0];
    
    expect(brand.name).toEqual('Test Brand');
    expect(brand.website_url).toBeNull();
    expect(brand.partnership_type).toBeNull();
    expect(brand.is_active).toEqual(true);
  });

  it('should maintain correct ordering with multiple brands', async () => {
    // Insert brands with various display orders
    const brandsWithOrders = [
      { ...testBrand1, display_order: 5, name: 'Fifth' },
      { ...testBrand2, display_order: 1, name: 'First' },
      { ...testBrand1, display_order: 3, name: 'Third' },
      { ...testBrand2, display_order: 2, name: 'Second' },
      { ...testBrand1, display_order: 4, name: 'Fourth' }
    ];

    await db.insert(brandsTable)
      .values(brandsWithOrders)
      .execute();

    const result = await getBrands();
    
    expect(result).toHaveLength(5);
    expect(result[0].name).toEqual('First');
    expect(result[1].name).toEqual('Second');
    expect(result[2].name).toEqual('Third');
    expect(result[3].name).toEqual('Fourth');
    expect(result[4].name).toEqual('Fifth');
  });
});