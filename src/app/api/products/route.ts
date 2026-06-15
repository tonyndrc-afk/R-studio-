import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';

const productSchema = z.object({
  title: z.string().min(1),
  sku: z.string().min(1),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  attributes: z.record(z.string()).default({}),
  dimensions: z.record(z.string()).default({}),
  images: z.array(z.string()).default([]),
});

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const parsed = productSchema.parse(await request.json());
  const product = await prisma.product.upsert({
    where: { sku: parsed.sku },
    update: { ...parsed, sourceUrl: parsed.sourceUrl || null },
    create: { ...parsed, sourceUrl: parsed.sourceUrl || null },
  });

  return NextResponse.json(product);
}
