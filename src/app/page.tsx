'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import type { NormalizedProduct, Ratio, VisualModule } from '@/lib/types';

const emptyProduct: NormalizedProduct = {
  title: '',
  sku: '',
  attributes: {},
  dimensions: {},
  images: [],
};

const presets = [
  'Packshot e-commerce propre, produit centré, éclairage homogène.',
  'Ambiance boutique sobre, fond beige web, merchandising professionnel, accent rouge RÉTIF.',
  'Mise en situation comptoir professionnel B2B, produit visible et réaliste.',
];
const businesses = ['boulangerie', 'CHR', 'fleuriste', 'agencement'];
const ctas = ['', 'Découvrir le catalogue', 'Demander un devis', 'Voir les produits', "Consulter l'offre", 'Contacter un conseiller', 'En savoir +', 'Retif.eu'];
const ratios: Ratio[] = ['1:1', '9:16', '16:9', '4:5', '4:6'];

type ProductWithId = NormalizedProduct & { id?: string };
type AssetCard = { id: string; filePath: string; module: VisualModule; status: string; createdAt: string; product: { title: string; sku: string }; folderId?: string | null };
type Folder = { id: string; name: string };

export default function Home() {
  const [product, setProduct] = useState<ProductWithId>(emptyProduct);
  const [assets, setAssets] = useState<AssetCard[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [module, setModule] = useState<VisualModule>('PACKSHOT');
  const [prompt, setPrompt] = useState(presets[0]);
  const [ratio, setRatio] = useState<Ratio>('1:1');
  const [decor, setDecor] = useState('intérieur boutique');
  const [business, setBusiness] = useState('boulangerie');
  const [cta, setCta] = useState('');
  const [withHuman, setWithHuman] = useState(false);
  const [isBusy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const canGenerate = useMemo(() => product.title.trim() && product.sku.trim(), [product]);

  async function loadGallery() {
    const [assetResponse, folderResponse] = await Promise.all([fetch('/api/assets'), fetch('/api/folders')]);
    setAssets(await assetResponse.json());
    setFolders(await folderResponse.json());
  }

  useEffect(() => {
    void loadGallery();
  }, []);

  async function saveProduct() {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Impossible d’enregistrer la fiche produit.');
    const saved = await response.json();
    setProduct(saved);
    return saved as ProductWithId;
  }

  async function scrapeProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const url = String(formData.get('url') ?? '');
    setBusy(true);
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      setProduct(await response.json());
      setMessage('Fiche mock importée. Vous pouvez corriger les champs avant génération.');
    } finally {
      setBusy(false);
    }
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    const response = await fetch('/api/upload', { method: 'POST', body: formData });
    const { paths } = await response.json();
    setProduct((current) => ({ ...current, images: [...current.images, ...paths] }));
  }

  async function generateVisual() {
    if (!canGenerate) return;
    setBusy(true);
    try {
      const savedProduct = product.id ? product : await saveProduct();
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: savedProduct.id,
          module,
          prompt,
          ratio,
          background: module === 'PACKSHOT' ? '#FFFFFF' : '#F6F4F1',
          decor,
          business,
          withHuman,
          cta: cta || undefined,
          view: 'vue',
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Génération impossible.');
      setMessage('Visuel généré et ajouté à la galerie.');
      await loadGallery();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erreur inconnue.');
    } finally {
      setBusy(false);
    }
  }

  async function createFolder() {
    const name = window.prompt('Nom du dossier');
    if (!name) return;
    await fetch('/api/folders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    await loadGallery();
  }

  async function updateAsset(id: string, payload: Record<string, string | null>) {
    await fetch(`/api/assets/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    await loadGallery();
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">RÉTIF · Groupe RAJA</p>
          <h1 className="mt-2 text-4xl">R STUDIO</h1>
          <p className="mt-2 max-w-2xl text-blue">Production visuelle IA interne avec providers mockés et charte verrouillée.</p>
        </div>
        <button className="btn" onClick={createFolder}>Créer un dossier</button>
      </header>

      {message ? <p className="rounded-2xl bg-beige p-4 text-sm font-semibold">{message}</p> : null}

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card space-y-4">
          <h2>Ingestion partagée</h2>
          <form className="flex gap-2" onSubmit={scrapeProduct}>
            <input className="input" name="url" placeholder="URL fiche produit RÉTIF" type="url" />
            <button className="btn" disabled={isBusy}>Importer</button>
          </form>
          <input type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadImages(event.target.files)} />
          <input className="input" placeholder="Titre produit" value={product.title} onChange={(event) => setProduct({ ...product, title: event.target.value })} />
          <input className="input" placeholder="SKU" value={product.sku} onChange={(event) => setProduct({ ...product, sku: event.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            {(['width', 'height', 'depth', 'weight'] as const).map((field) => (
              <input key={field} className="input" placeholder={field} value={product.dimensions[field] ?? ''} onChange={(event) => setProduct({ ...product, dimensions: { ...product.dimensions, [field]: event.target.value } })} />
            ))}
          </div>
          <button className="btn" onClick={saveProduct} disabled={isBusy || !canGenerate}>Enregistrer la fiche</button>
        </div>

        <div className="card space-y-4">
          <h2>Génération</h2>
          <select className="input" value={module} onChange={(event) => setModule(event.target.value as VisualModule)}>
            <option value="PACKSHOT">Module 1 — Packshot e-commerce</option>
            <option value="AMBIANCE">Module 2 — Visuel d’ambiance</option>
          </select>
          <label className="block rounded-2xl bg-webBeige p-3 text-sm"><input className="mr-2" type="checkbox" /> marketing — faces cachées reconstituées, non fidèle catalogue</label>
          <select className="input" value={prompt} onChange={(event) => setPrompt(event.target.value)}>{presets.map((preset) => <option key={preset}>{preset}</option>)}</select>
          <textarea className="input min-h-28" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <select className="input" value={decor} onChange={(event) => setDecor(event.target.value)}><option>intérieur boutique</option><option>vitrine</option><option>comptoir</option></select>
            <select className="input" value={business} onChange={(event) => setBusiness(event.target.value)}>{businesses.map((item) => <option key={item}>{item}</option>)}</select>
            <select className="input" value={ratio} onChange={(event) => setRatio(event.target.value as Ratio)}>{ratios.map((item) => <option key={item}>{item}</option>)}</select>
            <select className="input" value={cta} onChange={(event) => setCta(event.target.value)}>{ctas.map((item) => <option key={item}>{item}</option>)}</select>
          </div>
          <label><input className="mr-2" checked={withHuman} type="checkbox" onChange={(event) => setWithHuman(event.target.checked)} />avec humain</label>
          <button className="btn" onClick={generateVisual} disabled={isBusy || !canGenerate}>{isBusy ? 'Traitement…' : 'Générer'}</button>
        </div>
      </section>

      <section className="card space-y-4">
        <h2>Galerie & dossiers</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {assets.map((asset) => (
            <article key={asset.id} className="rounded-2xl border border-beige bg-webBeige p-3" draggable onDragStart={(event) => event.dataTransfer.setData('assetId', asset.id)}>
              <img src={asset.filePath} alt="Visuel généré" className="aspect-square w-full rounded-xl bg-white object-contain" />
              <p className="mt-3 font-semibold">{asset.product.title}</p>
              <p className="text-sm text-blue">{asset.product.sku} · {asset.module} · {asset.status}</p>
              <div className="mt-3 flex flex-wrap gap-2"><a className="btn" download href={asset.filePath}>Télécharger</a><button className="btn" onClick={() => updateAsset(asset.id, { status: 'VALIDATED' })}>Valider</button></div>
            </article>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {folders.map((folder) => (
            <div key={folder.id} className="rounded-2xl border border-dashed border-primary bg-white p-4" onDragOver={(event) => event.preventDefault()} onDrop={(event) => updateAsset(event.dataTransfer.getData('assetId'), { folderId: folder.id })}>📁 {folder.name}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
