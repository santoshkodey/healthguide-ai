/**
 * HealthGuide AI — Central Language & Speech Recognition Configuration
 *
 * Covers the 22 Eighth Schedule Languages of India + English (India).
 *
 * TRANSPARENCY PRINCIPLE:
 * We explicitly document the support tier for each language:
 * - 'browser-supported': Native BCP-47 locale widely supported by Chromium/WebKit Web Speech API.
 * - 'experimental': Partial, non-standardized, or platform-dependent browser engine support.
 * - 'unsupported_browser': Languages where standard browser voice engines do not bundle speech models.
 */

export type SpeechSupportTier = 'browser-supported' | 'experimental' | 'unsupported_browser';

export interface IndianLanguage {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  supportTier: SpeechSupportTier;
  supportNote: string;
}

export const INDIAN_LANGUAGES: IndianLanguage[] = [
  // 1. English (India)
  {
    code: 'en-IN',
    name: 'English (India)',
    nativeName: 'English (India)',
    script: 'Latin',
    supportTier: 'browser-supported',
    supportNote: 'Fully supported by all major browsers with Indian English acoustic models.',
  },
  // 2. Hindi
  {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    supportTier: 'browser-supported',
    supportNote: 'High accuracy speech recognition available across Chromium, Android, and WebKit.',
  },
  // 3. Bengali
  {
    code: 'bn-IN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    script: 'Bengali',
    supportTier: 'browser-supported',
    supportNote: 'Supported by Chrome and Android Web Speech API engines.',
  },
  // 4. Telugu
  {
    code: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    script: 'Telugu',
    supportTier: 'browser-supported',
    supportNote: 'Supported by Chrome, Android, and Chromium-based browsers.',
  },
  // 5. Tamil
  {
    code: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    script: 'Tamil',
    supportTier: 'browser-supported',
    supportNote: 'Supported across India (ta-IN) and Sri Lanka (ta-LK) locale models.',
  },
  // 6. Marathi
  {
    code: 'mr-IN',
    name: 'Marathi',
    nativeName: 'मराठी',
    script: 'Devanagari',
    supportTier: 'browser-supported',
    supportNote: 'Supported by Chromium Web Speech API.',
  },
  // 7. Gujarati
  {
    code: 'gu-IN',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    script: 'Gujarati',
    supportTier: 'browser-supported',
    supportNote: 'Supported by Chromium Web Speech API.',
  },
  // 8. Kannada
  {
    code: 'kn-IN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    script: 'Kannada',
    supportTier: 'browser-supported',
    supportNote: 'Supported by Chrome and Android speech engines.',
  },
  // 9. Malayalam
  {
    code: 'ml-IN',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    script: 'Malayalam',
    supportTier: 'browser-supported',
    supportNote: 'Supported by Chrome and Android speech engines.',
  },
  // 10. Punjabi
  {
    code: 'pa-IN',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    script: 'Gurmukhi',
    supportTier: 'browser-supported',
    supportNote: 'Supported by Chromium Web Speech API for Gurmukhi script.',
  },
  // 11. Odia
  {
    code: 'or-IN',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    script: 'Odia',
    supportTier: 'browser-supported',
    supportNote: 'Supported in modern Chromium engines; fallback to typing available.',
  },
  // 12. Urdu
  {
    code: 'ur-IN',
    name: 'Urdu',
    nativeName: 'اُردُو',
    script: 'Perso-Arabic',
    supportTier: 'browser-supported',
    supportNote: 'Supported across India (ur-IN) and Pakistan (ur-PK) models.',
  },
  // 13. Nepali
  {
    code: 'ne-NP',
    name: 'Nepali',
    nativeName: 'नेपाली',
    script: 'Devanagari',
    supportTier: 'browser-supported',
    supportNote: 'Supported by Chromium Web Speech API.',
  },
  // 14. Assamese
  {
    code: 'as-IN',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    script: 'Bengali-Assamese',
    supportTier: 'experimental',
    supportNote: 'Speech model availability varies depending on browser version and device OS.',
  },
  // 15. Sanskrit
  {
    code: 'sa-IN',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    script: 'Devanagari',
    supportTier: 'experimental',
    supportNote: 'Classical language model; recognized phonetically using Devanagari speech packs.',
  },
  // 16. Konkani
  {
    code: 'kok-IN',
    name: 'Konkani',
    nativeName: 'कोंकणी',
    script: 'Devanagari',
    supportTier: 'experimental',
    supportNote: 'Experimental speech recognition support; typing fallback is recommended.',
  },
  // 17. Maithili
  {
    code: 'mai-IN',
    name: 'Maithili',
    nativeName: 'मैथिली',
    script: 'Devanagari',
    supportTier: 'experimental',
    supportNote: 'Uses regional Devanagari acoustic models where available.',
  },
  // 18. Kashmiri
  {
    code: 'ks-IN',
    name: 'Kashmiri',
    nativeName: 'کٲشُر / कॉशुर',
    script: 'Perso-Arabic / Devanagari',
    supportTier: 'unsupported_browser',
    supportNote: 'Standard browser Web Speech API lacks trained speech models. Please type your symptoms.',
  },
  // 19. Dogri
  {
    code: 'doi-IN',
    name: 'Dogri',
    nativeName: 'डोगरी',
    script: 'Devanagari',
    supportTier: 'unsupported_browser',
    supportNote: 'Browser speech recognition models currently unavailable. Please type symptoms.',
  },
  // 20. Manipuri (Meitei)
  {
    code: 'mni-IN',
    name: 'Manipuri (Meitei)',
    nativeName: 'মৈতৈলোন্ / ꯃꯤꯇꯩꯂꯣꯟ',
    script: 'Bengali / Meetei Mayek',
    supportTier: 'unsupported_browser',
    supportNote: 'Browser speech recognition models currently unavailable. Please type symptoms.',
  },
  // 21. Bodo
  {
    code: 'brx-IN',
    name: 'Bodo',
    nativeName: 'बर\'',
    script: 'Devanagari',
    supportTier: 'unsupported_browser',
    supportNote: 'Browser speech recognition models currently unavailable. Please type symptoms.',
  },
  // 22. Santali
  {
    code: 'sat-IN',
    name: 'Santali',
    nativeName: 'संताली / ᱥᱟᱱᱛᱟᱲᱤ',
    script: 'Ol Chiki / Devanagari',
    supportTier: 'unsupported_browser',
    supportNote: 'Browser speech recognition models currently unavailable. Please type symptoms.',
  },
  // 23. Sindhi
  {
    code: 'sd-IN',
    name: 'Sindhi',
    nativeName: 'سنڌي / सिन्धी',
    script: 'Perso-Arabic / Devanagari',
    supportTier: 'unsupported_browser',
    supportNote: 'Browser speech recognition models currently unavailable. Please type symptoms.',
  },
];

export const DEFAULT_LANGUAGE = INDIAN_LANGUAGES[0]; // English (India)

export function findLanguageByCode(code: string): IndianLanguage | undefined {
  return INDIAN_LANGUAGES.find((lang) => lang.code.toLowerCase() === code.toLowerCase());
}

export function searchLanguages(query: string): IndianLanguage[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return INDIAN_LANGUAGES;

  return INDIAN_LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(clean) ||
      lang.nativeName.toLowerCase().includes(clean) ||
      lang.code.toLowerCase().includes(clean) ||
      lang.script.toLowerCase().includes(clean)
  );
}
