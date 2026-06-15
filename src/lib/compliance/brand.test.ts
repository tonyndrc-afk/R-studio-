import { describe, expect, it } from 'vitest';
import { enforceCompliance } from './brand';
describe('brand compliance', () => {
  it('blocks wild_card', () => expect(() => enforceCompliance({prompt:'x', background:'#FFFFFF', mode:'wild_card'})).toThrow('wild_card'));
  it('blocks invalid backgrounds', () => expect(() => enforceCompliance({prompt:'x', background:'#000000'})).toThrow('Fond'));
  it('blocks invalid CTA', () => expect(() => enforceCompliance({prompt:'x', background:'#FFFFFF', cta:'Acheter'})).toThrow('CTA'));
  it('injects negative prompt', () => expect(enforceCompliance({prompt:'x', background:'#F6F4F1'}).prompt).toContain('no watermark'));
});
