import type { NormalizedProduct } from '@/lib/types';
export interface ProductScraper { scrape(url:string): Promise<NormalizedProduct>; }
export class MockProductScraper implements ProductScraper { async scrape(url:string){ return { title:'Présentoir comptoir bois RÉTIF', sku:'RETIF-MOCK-001', sourceUrl:url, attributes:{ matière:'Bois clair', usage:'Comptoir', marque:'RÉTIF' }, dimensions:{ width:'40 cm', height:'60 cm', depth:'28 cm', weight:'3 kg' }, images:[] }; } }
export class RetifScraper implements ProductScraper { async scrape(): Promise<NormalizedProduct> { throw new Error('RetifScraper stub: analyser le DOM Magento RÉTIF, les images produit et attributs normalisés. Hors périmètre MVP.'); } }
export function getProductScraper(){ return process.env.PROVIDER === 'retif' ? new RetifScraper() : new MockProductScraper(); }
