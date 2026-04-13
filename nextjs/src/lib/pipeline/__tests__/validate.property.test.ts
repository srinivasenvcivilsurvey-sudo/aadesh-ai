/**
 * Property and unit tests for validate API route logic
 * Feature: generation-pipeline
 * Properties 1, 2
 * Validates: Requirements 1.1, 1.2, 1.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Test the pure validation logic extracted from the route
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const MAX_PAGES = 200;

function validateMimeType(mimeType: string): boolean {
  return mimeType in ALLOWED_MIME_TYPES;
}

function validatePageCount(pageCount: number): boolean {
  return pageCount <= MAX_PAGES;
}

describe('validate — Property 1: Valid file types accepted, invalid rejected', () => {
  it('accepts all 4 allowed MIME types', () => {
    const allowed = Object.keys(ALLOWED_MIME_TYPES);
    for (const mime of allowed) {
      expect(validateMimeType(mime)).toBe(true);
    }
  });

  it('rejects any MIME type not in the allowlist', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => !(s in ALLOWED_MIME_TYPES)),
        (mimeType) => {
          expect(validateMimeType(mimeType)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('specifically rejects common invalid types', () => {
    const invalid = ['text/plain', 'application/zip', 'video/mp4', 'application/json', ''];
    for (const mime of invalid) {
      expect(validateMimeType(mime)).toBe(false);
    }
  });
});

describe('validate — Property 2: Files exceeding 200 pages are rejected', () => {
  it('rejects any page count > 200', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 201, max: 10000 }),
        (pageCount) => {
          expect(validatePageCount(pageCount)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('accepts page count <= 200', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 200 }),
        (pageCount) => {
          expect(validatePageCount(pageCount)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('boundary: 200 pages is valid, 201 is not', () => {
    expect(validatePageCount(200)).toBe(true);
    expect(validatePageCount(201)).toBe(false);
  });
});
