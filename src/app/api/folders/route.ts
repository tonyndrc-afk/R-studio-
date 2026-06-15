import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';

const folderSchema = z.object({ name: z.string().min(1) });

export async function GET() {
  const folders = await prisma.folder.findMany({ include: { assets: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(folders);
}

export async function POST(request: Request) {
  const { name } = folderSchema.parse(await request.json());
  const folder = await prisma.folder.create({ data: { name } });
  return NextResponse.json(folder);
}
