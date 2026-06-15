import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getProductScraper } from '@/lib/providers/scraper';

const scrapeSchema = z.object({ url: z.string().url() });

export async function POST(request: Request) {
  const { url } = scrapeSchema.parse(await request.json());
  const product = await getProductScraper().scrape(url);
  return NextResponse.json(product);
}
