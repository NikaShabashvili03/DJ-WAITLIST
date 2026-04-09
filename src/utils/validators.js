import { EVENT_TYPES, GENRES, TRAVEL_OPTIONS, WAITLIST_TYPES } from '../constants/waitlist.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

export const normalizeEmail = (email) => {
  if (typeof email !== 'string') {
    return '';
  }

  return email.trim().toLowerCase();
};

export const isValidEmail = (email) => EMAIL_REGEX.test(normalizeEmail(email));

export const isValidUrl = (url) => {
  if (!isNonEmptyString(url)) {
    return false;
  }

  try {
    const parsed = new URL(url.trim());
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const toOptionalTrimmedString = (value) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const toOptionalNonNegativeNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : Number.NaN;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : Number.NaN;
  }

  return Number.NaN;
};

export const toOptionalDate = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean))];
};

export const normalizeTravelOption = (value) => {
  if (!value) {
    return undefined;
  }

  const aliases = {
    localOnly: 'local_only',
    local_only: 'local_only',
    nationwide: 'nationwide',
    international: 'international'
  };

  return aliases[value] || value;
};

export const ensureAllowedValue = (value, allowedValues) => {
  return value === undefined || allowedValues.includes(value);
};

export const validateGenreSelection = ({ genres, customGenre, fieldName, customFieldName }) => {
  if (genres.length === 0) {
    if (customGenre) {
      return `${customFieldName} should not be provided when ${fieldName} is empty.`;
    }
    return null;
  }

  const invalidGenres = genres.filter((genre) => !GENRES.includes(genre));
  if (invalidGenres.length > 0) {
    return `Invalid ${fieldName}: ${invalidGenres.join(', ')}`;
  }

  if (genres.includes('Custom') && !customGenre) {
    return `${customFieldName} is required when "Custom" is selected in ${fieldName}.`;
  }

  if (!genres.includes('Custom') && customGenre) {
    return `${customFieldName} should not be provided unless "Custom" is selected in ${fieldName}.`;
  }

  return null;
};

export const waitlistEnums = {
  WAITLIST_TYPES,
  GENRES,
  TRAVEL_OPTIONS,
  EVENT_TYPES
};
