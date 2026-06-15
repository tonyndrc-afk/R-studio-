import fs from 'node:fs/promises';
import path from 'node:path';

import type { GenerationInput, GenerationOutput, Ratio } from '@/lib/types';

export interface GenerationProvider {
  generate(input: GenerationInput): Promise<GenerationOutput>;
}

const ratioSizes: Record<Ratio, { width: number; height: number }> = {
  '1:1': { width: 1200, height: 1200 },
  '9:16': { width: 1080, height: 1920 },
  '16:9': { width: 1920, height: 1080 },
  '4:5': { width: 1200, height: 1500 },
  '4:6': { width: 1200, height: 1800 },
};

function escapeSvg(value: string) {
  return value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char);
}

function buildPlaceholderSvg(input: GenerationInput) {
  const size = ratioSizes[input.ratio];
  const centerX = size.width / 2;
  const centerY = size.height / 2;
  const cardWidth = Math.min(size.width * 0.48, 620);
  const cardHeight = Math.min(size.height * 0.46, 720);
  const label = input.module === 'PACKSHOT' ? 'PACKSHOT FOND BLANC' : `${input.decor ?? 'AMBIANCE'} · ${input.business ?? 'B2B'}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">
  <rect width="100%" height="100%" fill="${input.background}"/>
  <rect x="${centerX - cardWidth / 2}" y="${centerY - cardHeight / 2}" width="${cardWidth}" height="${cardHeight}" rx="36" fill="#FFFFFF" stroke="#EEE9E0" stroke-width="18"/>
  <circle cx="${centerX}" cy="${centerY - 60}" r="${Math.min(cardWidth, cardHeight) * 0.26}" fill="#F6F4F1"/>
  <path d="M ${centerX - cardWidth * 0.32} ${centerY + cardHeight * 0.28} H ${centerX + cardWidth * 0.32}" stroke="#E5271D" stroke-width="30" stroke-linecap="round"/>
  <text x="${centerX}" y="${centerY + cardHeight * 0.42}" text-anchor="middle" font-family="Poppins, Arial" font-size="46" font-weight="600" fill="#0D0802">${escapeSvg(input.product.title)}</text>
  <text x="${centerX}" y="${centerY + cardHeight * 0.42 + 58}" text-anchor="middle" font-family="Poppins, Arial" font-size="28" fill="#406577">${escapeSvg(label)}</text>
</svg>`;
}

export class MockGenerationProvider implements GenerationProvider {
  async generate(input: GenerationInput): Promise<GenerationOutput> {
    const outputDir = path.join(process.cwd(), 'public', 'generated');
    await fs.mkdir(outputDir, { recursive: true });

    const suffix = input.module === 'PACKSHOT' ? `${input.view ?? 'vue'}_blanc` : `${input.decor ?? 'ambiance'}_${input.ratio}`;
    const fileName = `${input.product.sku}_${suffix}_${Date.now()}.svg`.replace(/[^a-zA-Z0-9_.-]/g, '_');
    await fs.writeFile(path.join(outputDir, fileName), buildPlaceholderSvg(input), 'utf8');

    return {
      filePath: `/generated/${fileName}`,
      metadata: {
        provider: 'mock',
        ratio: input.ratio,
        decor: input.decor,
        business: input.business,
        withHuman: Boolean(input.withHuman),
        cta: input.cta,
      },
    };
  }
}

export class HiggsfieldProvider implements GenerationProvider {
  async generate(): Promise<GenerationOutput> {
    if (!process.env.HIGGSFIELD_API_KEY) {
      throw new Error('HIGGSFIELD_API_KEY manquante. TODO: brancher le client Higgsfield réel ici.');
    }

    throw new Error('HiggsfieldProvider stub: implémentation réelle hors périmètre MVP.');
  }
}

export function getGenerationProvider(): GenerationProvider {
  return process.env.PROVIDER === 'higgsfield' ? new HiggsfieldProvider() : new MockGenerationProvider();
}
