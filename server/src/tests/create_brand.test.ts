import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { brandsTable } from '../db/schema';
import { type CreateBrandInput } from '../schema';
import { createBrand } from '../handlers/create_brand';
import { eq } from 'drizzle-orm';

// Complete test input with all fields
const testInput: CreateBrandInput = {
  name: 'Test Brand',
  logo_url: 'https://example.com/logo.png',
  website_url: 'https://testbrand.com',
  partnership_type: 'sponsor',
  is_active: true,
  display_order: 5
};

// Minimal test input (only required fields plus defaults)
const minimalInput: CreateBrandInput = {
  name: 'Minimal Brand',
  logo_url: 'https://example.com/minimal-logo.png',
  is_active: true, // Include Zod default
  display_order: 0 // Include Zod default
};

describe('createBrand', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a brand with all fields', async () => {
    const result = await createBrand(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Brand');
    expect(result.logo_url).toEqual('https://example.com/logo.png');
    expect(result.website_url).toEqual('https://testbrand.com');
    expect(result.partnership_type).toEqual('sponsor');
    expect(result.is_active).toEqual(true);
    expect(result.display_order).toEqual(5);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a brand with minimal fields and apply defaults', async () => {
    const result = await createBrand(minimalInput);

    // Basic field validation
    expect(result.name).toEqual('Minimal Brand');
    expect(result.logo_url).toEqual('https://example.com/minimal-logo.png');
    expect(result.website_url).toBeNull();
    expect(result.partnership_type).toBeNull();
    expect(result.is_active).toEqual(true); // Default value
    expect(result.display_order).toEqual(0); // Default value
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save brand to database', async () => {
    const result = await createBrand(testInput);

    // Query using proper drizzle syntax
    const brands = await db.select()
      .from(brandsTable)
      .where(eq(brandsTable.id, result.id))
      .execute();

    expect(brands).toHaveLength(1);
    expect(brands[0].name).toEqual('Test Brand');
    expect(brands[0].logo_url).toEqual('https://example.com/logo.png');
    expect(brands[0].website_url).toEqual('https://testbrand.com');
    expect(brands[0].partnership_type).toEqual('sponsor');
    expect(brands[0].is_active).toEqual(true);
    expect(brands[0].display_order).toEqual(5);
    expect(brands[0].created_at).toBeInstanceOf(Date);
    expect(brands[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null optional fields correctly', async () => {
    const inputWithNulls: CreateBrandInput = {
      name: 'Brand with Nulls',
      logo_url: 'https://example.com/null-logo.png',
      website_url: null,
      partnership_type: null,
      is_active: false,
      display_order: 10
    };

    const result = await createBrand(inputWithNulls);

    expect(result.name).toEqual('Brand with Nulls');
    expect(result.website_url).toBeNull();
    expect(result.partnership_type).toBeNull();
    expect(result.is_active).toEqual(false);
    expect(result.display_order).toEqual(10);

    // Verify in database
    const brands = await db.select()
      .from(brandsTable)
      .where(eq(brandsTable.id, result.id))
      .execute();

    expect(brands[0].website_url).toBeNull();
    expect(brands[0].partnership_type).toBeNull();
    expect(brands[0].is_active).toEqual(false);
  });

  it('should create multiple brands with different display orders', async () => {
    const brand1Input: CreateBrandInput = {
      name: 'Brand 1',
      logo_url: 'https://example.com/brand1.png',
      is_active: true, // Include required field
      display_order: 1
    };

    const brand2Input: CreateBrandInput = {
      name: 'Brand 2',
      logo_url: 'https://example.com/brand2.png',
      is_active: true, // Include required field
      display_order: 2
    };

    const result1 = await createBrand(brand1Input);
    const result2 = await createBrand(brand2Input);

    expect(result1.display_order).toEqual(1);
    expect(result2.display_order).toEqual(2);
    expect(result1.id).not.toEqual(result2.id);

    // Verify both exist in database
    const allBrands = await db.select().from(brandsTable).execute();
    expect(allBrands).toHaveLength(2);
  });

  it('should set timestamps automatically', async () => {
    const beforeCreate = new Date();
    const result = await createBrand(testInput);
    const afterCreate = new Date();

    // Timestamps should be between before and after
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());

    // Initially, created_at and updated_at should be very close or equal
    const timeDiff = Math.abs(result.updated_at.getTime() - result.created_at.getTime());
    expect(timeDiff).toBeLessThan(1000); // Less than 1 second difference
  });
});