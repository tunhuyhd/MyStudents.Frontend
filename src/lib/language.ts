export type Language = 'vi' | 'en';

export const DEFAULT_LANGUAGE: Language = 'vi';
export const LANGUAGE_STORAGE_KEY = 'language';

export function getStoredLanguage(storage: Pick<Storage, 'getItem'>): Language {
  try {
    const savedLanguage = storage.getItem(LANGUAGE_STORAGE_KEY);
    return savedLanguage === 'vi' || savedLanguage === 'en'
      ? savedLanguage
      : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function setDocumentLanguage(language: Language, root: Pick<HTMLElement, 'lang'>): void {
  root.lang = language;
}

export function persistLanguage(
  language: Language,
  storage: Pick<Storage, 'setItem'>,
  root: Pick<HTMLElement, 'lang'>,
): void {
  storage.setItem(LANGUAGE_STORAGE_KEY, language);
  setDocumentLanguage(language, root);
}
