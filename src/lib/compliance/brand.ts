export const allowedBackgrounds = ['#FFFFFF', '#F6F4F1'] as const;

export const allowedCtas = [
  'Découvrir le catalogue',
  'Demander un devis',
  'Voir les produits',
  "Consulter l'offre",
  'Contacter un conseiller',
  'En savoir +',
  'Retif.eu',
] as const;

export const negativePrompt =
  'no text, no logo, no watermark, no dark background, no fantasy elements';

export type ComplianceInput = {
  prompt: string;
  background: string;
  mode?: string;
  cta?: string;
  detectedText?: boolean;
  dominantColor?: string;
};

export type ComplianceWarnings = {
  hasText: boolean;
  offBrandColor: boolean;
};

export function enforceCompliance(input: ComplianceInput) {
  if (input.mode === 'wild_card') {
    throw new Error('Le mode wild_card est bloqué par la plateforme.');
  }

  if (!allowedBackgrounds.includes(input.background as (typeof allowedBackgrounds)[number])) {
    throw new Error('Fond non autorisé par la charte.');
  }

  if (input.cta && !allowedCtas.includes(input.cta as (typeof allowedCtas)[number])) {
    throw new Error('CTA non autorisé par la charte.');
  }

  return {
    prompt: [
      input.prompt,
      'Contraintes charte RÉTIF: fonds uniquement #FFFFFF ou #F6F4F1, accent dominant #E5271D.',
      `Negative prompt: ${negativePrompt}`,
    ].join('\n'),
    warnings: auditOutput(input),
  };
}

export function auditOutput(input: ComplianceInput): ComplianceWarnings {
  const forbiddenColors = ['violet', 'purple', 'pink', 'rose', 'neon green', 'vert fluo', 'orange'];
  const dominantColor = input.dominantColor?.toLowerCase() ?? '';

  return {
    hasText: Boolean(input.detectedText),
    offBrandColor: forbiddenColors.some((color) => dominantColor.includes(color)),
  };
}
