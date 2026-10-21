import { describe, it, expect } from 'vitest';
import {
  INDIAN_LANGUAGES,
  DEFAULT_LANGUAGE,
  findLanguageByCode,
  searchLanguages,
} from '@/lib/languages';

describe('Central Language & Speech Recognition Catalog', () => {
  it('contains 23 languages (English India + 22 Eighth Schedule languages)', () => {
    expect(INDIAN_LANGUAGES).toHaveLength(23);
  });

  it('sets English (India) as the default language', () => {
    expect(DEFAULT_LANGUAGE.code).toBe('en-IN');
    expect(DEFAULT_LANGUAGE.name).toBe('English (India)');
    expect(DEFAULT_LANGUAGE.supportTier).toBe('browser-supported');
  });

  it('covers key major Indian languages with verified browser support', () => {
    const browserSupported = INDIAN_LANGUAGES.filter((l) => l.supportTier === 'browser-supported');
    const supportedCodes = browserSupported.map((l) => l.code);

    expect(supportedCodes).toContain('en-IN');
    expect(supportedCodes).toContain('hi-IN');
    expect(supportedCodes).toContain('bn-IN');
    expect(supportedCodes).toContain('te-IN');
    expect(supportedCodes).toContain('ta-IN');
    expect(supportedCodes).toContain('mr-IN');
    expect(supportedCodes).toContain('gu-IN');
    expect(supportedCodes).toContain('kn-IN');
    expect(supportedCodes).toContain('ml-IN');
    expect(supportedCodes).toContain('pa-IN');
    expect(supportedCodes).toContain('or-IN');
    expect(supportedCodes).toContain('ur-IN');
    expect(supportedCodes).toContain('ne-NP');
  });

  it('honestly marks languages without standard browser speech models as unsupported_browser', () => {
    const unsupported = INDIAN_LANGUAGES.filter((l) => l.supportTier === 'unsupported_browser');
    const unsupportedCodes = unsupported.map((l) => l.code);

    // Eighth Schedule languages without standard browser acoustic models
    expect(unsupportedCodes).toContain('ks-IN'); // Kashmiri
    expect(unsupportedCodes).toContain('doi-IN'); // Dogri
    expect(unsupportedCodes).toContain('mni-IN'); // Manipuri
    expect(unsupportedCodes).toContain('brx-IN'); // Bodo
    expect(unsupportedCodes).toContain('sat-IN'); // Santali
    expect(unsupportedCodes).toContain('sd-IN'); // Sindhi

    unsupported.forEach((lang) => {
      expect(lang.supportNote.toLowerCase()).toContain('type');
    });
  });

  it('marks experimental languages with transparent notes', () => {
    const experimental = INDIAN_LANGUAGES.filter((l) => l.supportTier === 'experimental');
    const experimentalCodes = experimental.map((l) => l.code);

    expect(experimentalCodes).toContain('as-IN'); // Assamese
    expect(experimentalCodes).toContain('sa-IN'); // Sanskrit
    expect(experimentalCodes).toContain('kok-IN'); // Konkani
    expect(experimentalCodes).toContain('mai-IN'); // Maithili
  });

  it('provides native script representations for all languages', () => {
    INDIAN_LANGUAGES.forEach((lang) => {
      expect(lang.nativeName).toBeTruthy();
      expect(lang.script).toBeTruthy();
      expect(lang.code).toMatch(/^[a-z]{2,3}-[A-Z]{2}$/);
    });
  });

  it('finds language by BCP-47 code case-insensitively', () => {
    const hindi = findLanguageByCode('hi-in');
    expect(hindi?.name).toBe('Hindi');
    expect(hindi?.nativeName).toBe('हिन्दी');

    const telugu = findLanguageByCode('TE-IN');
    expect(telugu?.name).toBe('Telugu');
    expect(telugu?.nativeName).toBe('తెలుగు');

    const unknown = findLanguageByCode('xx-XX');
    expect(unknown).toBeUndefined();
  });

  it('searches languages by English name, native script, or code', () => {
    // English query
    const marathiResults = searchLanguages('Marathi');
    expect(marathiResults.some((l) => l.code === 'mr-IN')).toBe(true);

    // Native script query
    const tamilResults = searchLanguages('தமிழ்');
    expect(tamilResults.some((l) => l.code === 'ta-IN')).toBe(true);

    // Code query
    const gujaratiResults = searchLanguages('gu-in');
    expect(gujaratiResults.some((l) => l.code === 'gu-IN')).toBe(true);

    // Empty query returns all
    expect(searchLanguages('')).toHaveLength(23);
    expect(searchLanguages('   ')).toHaveLength(23);
  });
});
