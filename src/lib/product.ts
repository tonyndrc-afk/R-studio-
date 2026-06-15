import type { Product } from '@prisma/client';

import type { NormalizedProduct } from '@/lib/types';

function asRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, String(entry ?? '')]),
  );
}

function asImages(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

export function productToNormalized(product: Product): NormalizedProduct {
  return {
    title: product.title,
    sku: product.sku,
    sourceUrl: product.sourceUrl ?? undefined,
    attributes: asRecord(product.attributes),
    dimensions: asRecord(product.dimensions),
    images: asImages(product.images),
  };
}
