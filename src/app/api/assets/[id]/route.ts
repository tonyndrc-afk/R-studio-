import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';

const updateAssetSchema = z.object({
  status: z.enum(['DRAFT', 'VALIDATED']).optional(),
  folderId: z.string().nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const input = updateAssetSchema.parse(await request.json());
  const asset = await prisma.asset.update({
    where: { id: params.id },
    data: input,
    include: { product: true, folder: true },
  });

  return NextResponse.json(asset);
}
