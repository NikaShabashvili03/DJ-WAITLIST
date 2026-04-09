import express from 'express';
import Waitlist, {
  GENRES,
  TRAVEL_OPTIONS,
  EVENT_TYPES
} from '../models/Waitlist.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const isValidEmail = (email) => {
  if (!isNonEmptyString(email)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const isValidUrl = (url) => {
  if (!isNonEmptyString(url)) return true;

  try {
    new URL(url.trim());
    return true;
  } catch {
    return false;
  }
};

const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : NaN;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  return NaN;
};

const parseOptionalDate = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'INVALID_DATE';

  return date;
};

const normalizeTravelOption = (value) => {
  if (!value) return null;

  const mapping = {
    localOnly: 'local_only',
    local_only: 'local_only',
    nationwide: 'nationwide',
    international: 'international'
  };

  return mapping[value] || value;
};

const pickArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter((item) => isNonEmptyString(item)).map((item) => item.trim());
  }

  return [];
};

const buildSocialLinks = (body) => {
  const instagram =
    body?.socialLinks?.instagram ||
    body?.instagramUrl ||
    null;

  const soundcloud = body?.socialLinks?.soundcloud || null;
  const youtube = body?.socialLinks?.youtube || null;
  const spotify = body?.socialLinks?.spotify || null;

  return {
    instagram: isNonEmptyString(instagram) ? instagram.trim() : null,
    soundcloud: isNonEmptyString(soundcloud) ? soundcloud.trim() : null,
    youtube: isNonEmptyString(youtube) ? youtube.trim() : null,
    spotify: isNonEmptyString(spotify) ? spotify.trim() : null
  };
};

const normalizePayload = (body) => {
  const type = isNonEmptyString(body.type) ? body.type.trim().toLowerCase() : null;
  const fullName = body.fullName || body.fullname || null;
  const phoneNumber = body.phoneNumber || body.phone || null;
  const stageName = body.stageName || body.djStageName || null;
  const heardAboutUs = body.heardAboutUs || body.howDidYouHearAboutUs || null;
  const typicalRatePerSetUsd =
    body.typicalRatePerSetUsd ?? body.typicalRatePerSet ?? null;

  const normalized = {
    type,
    fullName: isNonEmptyString(fullName) ? fullName.trim() : null,
    email: isNonEmptyString(body.email) ? body.email.trim().toLowerCase() : null,
    phoneNumber: isNonEmptyString(phoneNumber) ? phoneNumber.trim() : null,
    stageName: isNonEmptyString(stageName) ? stageName.trim() : null,
    location: isNonEmptyString(body.location) ? body.location.trim() : null,
    genres: pickArray(body.genres),
    customGenre: isNonEmptyString(body.customGenre) ? body.customGenre.trim() : null,
    socialLinks: buildSocialLinks(body),
    shortBio: isNonEmptyString(body.shortBio) ? body.shortBio.trim() : null,
    yearsOfExperience: parseOptionalNumber(body.yearsOfExperience),
    typicalRatePerSetUsd: parseOptionalNumber(typicalRatePerSetUsd),
    openToTravel: normalizeTravelOption(body.openToTravel || body.availability),
    heardAboutUs: isNonEmptyString(heardAboutUs) ? heardAboutUs.trim() : null,
    eventType: isNonEmptyString(body.eventType) ? body.eventType.trim().toLowerCase() : null,
    eventTypeOther: isNonEmptyString(body.eventTypeOther) ? body.eventTypeOther.trim() : null,
    eventDate: parseOptionalDate(body.eventDate),
    budgetRange: isNonEmptyString(body.budgetRange) ? body.budgetRange.trim() : null,
    preferredGenres: pickArray(body.preferredGenres),
    preferredCustomGenre: isNonEmptyString(body.preferredCustomGenre)
      ? body.preferredCustomGenre.trim()
      : null,
    additionalInfo: isNonEmptyString(body.additionalInfo)
      ? body.additionalInfo.trim()
      : null
  };

  if (
    normalized.type === 'customer' &&
    normalized.preferredGenres.length === 0 &&
    Array.isArray(body.genres)
  ) {
    normalized.preferredGenres = pickArray(body.genres);
  }

  return normalized;
};

const validateGenres = ({ values, customValue, fieldName, customFieldName }) => {
  if (!Array.isArray(values)) return `${fieldName} must be an array.`;

  const invalidGenres = values.filter((genre) => !GENRES.includes(genre));
  if (invalidGenres.length > 0) {
    return `Invalid ${fieldName}: ${invalidGenres.join(', ')}`;
  }

  const hasCustom = values.includes('Custom');

  if (hasCustom && !isNonEmptyString(customValue)) {
    return `${customFieldName} is required when "Custom" is included in ${fieldName}.`;
  }

  if (!hasCustom && isNonEmptyString(customValue)) {
    return `${customFieldName} should not be provided unless "Custom" is included in ${fieldName}.`;
  }

  return null;
};

const validateSocialLinks = (socialLinks, type) => {
  const allowedFields =
    type === 'dj'
      ? ['instagram', 'soundcloud', 'youtube', 'spotify']
      : ['instagram'];

  for (const field of allowedFields) {
    const value = socialLinks?.[field];
    if (value && !isValidUrl(value)) {
      return `Invalid ${field} URL.`;
    }
  }

  return null;
};

const validateBaseFields = (payload) => {
  if (!payload.email) return 'Email is required.';
  if (!isValidEmail(payload.email)) return 'Invalid email format.';

  if (!payload.type || !['dj', 'customer'].includes(payload.type)) {
    return 'Type must be "dj" or "customer".';
  }

  if (!payload.fullName) {
    return 'Full name is required.';
  }

  if (payload.yearsOfExperience !== null) {
    if (Number.isNaN(payload.yearsOfExperience) || payload.yearsOfExperience < 0) {
      return 'yearsOfExperience must be a non-negative number.';
    }
  }

  if (payload.typicalRatePerSetUsd !== null) {
    if (Number.isNaN(payload.typicalRatePerSetUsd) || payload.typicalRatePerSetUsd < 0) {
      return 'typicalRatePerSetUsd must be a non-negative number.';
    }
  }

  if (payload.eventDate === 'INVALID_DATE') {
    return 'Invalid eventDate.';
  }

  const socialLinksError = validateSocialLinks(payload.socialLinks, payload.type);
  if (socialLinksError) return socialLinksError;

  return null;
};

const validateDjPayload = (payload) => {
  if (!payload.stageName) {
    return 'stageName is required for DJs.';
  }

  if (payload.openToTravel && !TRAVEL_OPTIONS.includes(payload.openToTravel)) {
    return 'openToTravel must be one of: local_only, nationwide, international.';
  }

  const genresError = validateGenres({
    values: payload.genres,
    customValue: payload.customGenre,
    fieldName: 'genres',
    customFieldName: 'customGenre'
  });

  if (genresError) return genresError;

  return null;
};

const validateCustomerPayload = (payload) => {
  if (!payload.eventType || !EVENT_TYPES.includes(payload.eventType)) {
    return 'Invalid eventType.';
  }

  if (payload.eventType === 'other' && !payload.eventTypeOther) {
    return 'eventTypeOther is required when eventType is "other".';
  }

  if (payload.eventType !== 'other' && payload.eventTypeOther) {
    return 'eventTypeOther should only be provided when eventType is "other".';
  }

  const preferredGenresError = validateGenres({
    values: payload.preferredGenres,
    customValue: payload.preferredCustomGenre,
    fieldName: 'preferredGenres',
    customFieldName: 'preferredCustomGenre'
  });

  if (preferredGenresError) return preferredGenresError;

  return null;
};

const createPersistedPayload = (payload) => {
  const basePayload = {
    type: payload.type,
    fullName: payload.fullName,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    location: payload.location,
    heardAboutUs: payload.heardAboutUs,
    socialLinks: payload.socialLinks
  };

  if (payload.type === 'dj') {
    return {
      ...basePayload,
      stageName: payload.stageName,
      genres: payload.genres,
      customGenre: payload.customGenre,
      shortBio: payload.shortBio,
      yearsOfExperience: payload.yearsOfExperience,
      typicalRatePerSetUsd: payload.typicalRatePerSetUsd,
      openToTravel: payload.openToTravel
    };
  }

  return {
    ...basePayload,
    eventType: payload.eventType,
    eventTypeOther: payload.eventTypeOther,
    eventDate: payload.eventDate || null,
    budgetRange: payload.budgetRange,
    preferredGenres: payload.preferredGenres,
    preferredCustomGenre: payload.preferredCustomGenre,
    additionalInfo: payload.additionalInfo
  };
};

router.post('/', async (req, res) => {
  try {
    const payload = normalizePayload(req.body);

    const baseError = validateBaseFields(payload);
    if (baseError) {
      return res.status(400).json({
        success: false,
        message: baseError
      });
    }

    const typeError =
      payload.type === 'dj'
        ? validateDjPayload(payload)
        : validateCustomerPayload(payload);

    if (typeError) {
      return res.status(400).json({
        success: false,
        message: typeError
      });
    }

    const existingEntry = await Waitlist.findOne({ email: payload.email });
    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'Email already on waitlist.'
      });
    }

    const dataToSave = createPersistedPayload(payload);
    const waitlistEntry = await Waitlist.create(dataToSave);

    return res.status(201).json({
      success: true,
      message: 'Successfully joined waitlist.',
      data: {
        id: waitlistEntry._id,
        email: waitlistEntry.email,
        type: waitlistEntry.type,
        createdAt: waitlistEntry.createdAt
      }
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already on waitlist.'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        error: messages.join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

router.get('/count', async (req, res) => {
  try {
    const [total, dj, customer] = await Promise.all([
      Waitlist.countDocuments(),
      Waitlist.countDocuments({ type: 'dj' }),
      Waitlist.countDocuments({ type: 'customer' })
    ]);

    return res.json({
      success: true,
      message: 'Waitlist counts retrieved successfully.',
      data: {
        total,
        dj,
        customer
      }
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

export default router;