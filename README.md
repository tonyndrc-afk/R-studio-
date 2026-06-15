# R STUDIO — RÉTIF MVP

MVP Next.js exécutable pour générer des packshots et visuels d'ambiance mockés, avec charte verrouillée.

## Setup
```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

## Variables
- `DATABASE_URL`: SQLite Prisma, par défaut `file:./dev.db`.
- `PROVIDER=mock`: utilise les adaptateurs mock sans clé API.
- `PROVIDER=higgsfield`: active le stub `HiggsfieldProvider` (TODO branchement réel) et lit `HIGGSFIELD_API_KEY`.

## Points d'intégration
- Génération: `src/lib/providers/generation.ts` expose `GenerationProvider`, `MockGenerationProvider` et le stub `HiggsfieldProvider`.
- Scraping: `src/lib/providers/scraper.ts` expose `ProductScraper`, `MockProductScraper` et le stub `RetifScraper` pour DOM RÉTIF / Magento.
- Détourage: `src/lib/providers/background.ts` expose `BackgroundRemover` et un mock pass-through.

## Tokens de marque
Rouge `#E5271D`, blanc `#FFFFFF`, texte `#0D0802`, bleu `#406577`, vert gris `#ABCCC9`, beige `#EEE9E0`, beige web `#F6F4F1`. Le noir est réservé au texte. Police Poppins.

## Hors périmètre documenté
Vrai scraping, vraie génération IA, vrai détourage, SSO, RGPD, quotas/coûts API, image-to-3D et insertion réelle d'humains restent des TODO.
