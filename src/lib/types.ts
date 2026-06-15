export type NormalizedProduct = {
  title: string;
  sku: string;
  sourceUrl?: string;
  attributes: Record<string, string>;
  dimensions: {
    width?: string;
    height?: string;
    depth?: string;
    weight?: string;
  };
  images: string[];
};

export type Ratio = '1:1' | '9:16' | '16:9' | '4:5' | '4:6';
export type VisualModule = 'PACKSHOT' | 'AMBIANCE';

export type GenerationInput = {
  product: NormalizedProduct;
  prompt: string;
  referenceImages: string[];
  ratio: Ratio;
  background: '#FFFFFF' | '#F6F4F1';
  module: VisualModule;
  withHuman?: boolean;
  cta?: string;
  view?: string;
  decor?: string;
  business?: string;
};

export type GenerationOutput = {
  filePath: string;
  metadata: Record<string, unknown>;
};
