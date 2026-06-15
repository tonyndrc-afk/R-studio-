import { NextResponse } from 'next/server';
import { z } from 'zod';

import { enforceCompliance } from '@/lib/compliance/brand';
import { prisma } from '@/lib/prisma';
import { getGenerationProvider } from '@/lib/providers/generation';
import { productToNormalized } from '@/lib/product';

const generationSchema = z.object({
  productId: z.string().min(1),
  module: z.enum(['PACKSHOT', 'AMBIANCE']),
  prompt: z.string().min(1),
  ratio: z.enum(['1:1', '9:16', '16:9', '4:5', '4:6']),
  background: z.enum(['#FFFFFF', '#F6F4F1']),
  mode: z.string().optional(),
  cta: z.string().optional(),
  view: z.string().optional(),
  decor: z.string().optional(),
  business: z.string().optional(),
  withHuman: z.boolean().optional(),
});

export async function POST(request: Request) {
  const input = generationSchema.parse(await request.json());
  const product = await prisma.product.findUniqueOrThrow({ where: { id: input.productId } });
  const job = await prisma.job.create({
    data: { productId: product.id, module: input.module, status: 'RUNNING', input },
  });

  try {
    const normalizedProduct = productToNormalized(product);
    const compliance = enforceCompliance({
      prompt: input.prompt,
      background: input.background,
      mode: input.mode,
      cta: input.cta,
    });

    const output = await getGenerationProvider().generate({
      ...input,
      product: normalizedProduct,
      prompt: compliance.prompt,
      referenceImages: normalizedProduct.images,
    });

    const asset = await prisma.asset.create({
      data: {
        productId: product.id,
        module: input.module,
        filePath: output.filePath,
        prompt: compliance.prompt,
        sourceUrl: product.sourceUrl,
        metadata: output.metadata,
        compliance: compliance.warnings,
      },
      include: { product: true, folder: true },
    });

    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'COMPLETED', result: { assetId: asset.id, filePath: asset.filePath } },
    });

    return NextResponse.json({ jobId: job.id, asset });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur de génération';
    await prisma.job.update({ where: { id: job.id }, data: { status: 'FAILED', error: message } });
    return NextResponse.json({ jobId: job.id, error: message }, { status: 400 });
  }
}
