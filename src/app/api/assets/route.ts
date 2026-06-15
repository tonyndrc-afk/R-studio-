import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const module = url.searchParams.get('module');
  const status = url.searchParams.get('status');
  const productId = url.searchParams.get('productId');

  const assets = await prisma.asset.findMany({
    where: {
      ...(module ? { module: module as 'PACKSHOT' | 'AMBIANCE' } : {}),
      ...(status ? { status: status as 'DRAFT' | 'VALIDATED' } : {}),
      ...(productId ? { productId } : {}),
    },
    include: { product: true, folder: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(assets);
}
