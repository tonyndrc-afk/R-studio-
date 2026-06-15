import fs from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll('files').filter((file): file is File => file instanceof File);
  const outputDir = path.join(process.cwd(), 'public', 'generated', 'uploads');
  await fs.mkdir(outputDir, { recursive: true });

  const paths: string[] = [];
  for (const file of files) {
    if (!allowedTypes.has(file.type)) continue;
    const fileName = `${Date.now()}_${file.name}`.replace(/[^a-zA-Z0-9_.-]/g, '_');
    await fs.writeFile(path.join(outputDir, fileName), Buffer.from(await file.arrayBuffer()));
    paths.push(`/generated/uploads/${fileName}`);
  }

  return NextResponse.json({ paths });
}
