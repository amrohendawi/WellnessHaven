// Helper functions for localization
export interface LocalizedEntity {
  nameEn?: string | null;
  nameAr?: string | null;
  nameDe?: string | null;
  nameTr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  descriptionDe?: string | null;
  descriptionTr?: string | null;
}

/**
 * Get the localized name for an entity based on the current language
 * Falls back to English if the requested language is not available
 */
export function getLocalizedName(entity: LocalizedEntity, language: string): string {
  const nameKey =
    `name${language.charAt(0).toUpperCase()}${language.slice(1)}` as keyof LocalizedEntity;

  // Try to get the name in the requested language
  let name = entity[nameKey] as string | null | undefined;

  // If not available, fall back to English
  if (!name && language !== 'en') {
    name = entity.nameEn;
  }

  return name || '';
}

/**
 * Get the localized description for an entity based on the current language
 * Falls back to English if the requested language is not available
 */
export function getLocalizedDescription(entity: LocalizedEntity, language: string): string {
  const descKey =
    `description${language.charAt(0).toUpperCase()}${language.slice(1)}` as keyof LocalizedEntity;

  // Try to get the description in the requested language
  let description = entity[descKey] as string | null | undefined;

  // If not available, fall back to English
  if (!description && language !== 'en') {
    description = entity.descriptionEn;
  }

  return description || '';
}
