import mongoose from 'mongoose';

export const WAITLIST_TYPES = ['dj', 'customer'];

export const GENRES = [
  'House',
  'Techno',
  'EDM',
  'Hip-Hop',
  'R&B',
  'Afrobeats',
  'Drum & Bass',
  'Trance',
  'Reggaeton',
  'Pop',
  'Latin',
  'Amapiano',
  'Custom'
];

export const TRAVEL_OPTIONS = ['local_only', 'nationwide', 'international'];

export const EVENT_TYPES = [
  'birthday_party',
  'wedding',
  'house_party',
  'club_night',
  'festival',
  'corporate_event',
  'bar_mitzvah',
  'graduation',
  'holiday_party',
  'other'
];

const socialLinksSchema = new mongoose.Schema(
  {
    instagram: {
      type: String,
      trim: true,
      default: null
    },
    soundcloud: {
      type: String,
      trim: true,
      default: null
    },
    youtube: {
      type: String,
      trim: true,
      default: null
    },
    spotify: {
      type: String,
      trim: true,
      default: null
    }
  },
  { _id: false }
);

const waitlistSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: WAITLIST_TYPES,
      required: true,
      trim: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    phoneNumber: {
      type: String,
      trim: true,
      default: null
    },

    location: {
      type: String,
      trim: true,
      default: null
    },

    heardAboutUs: {
      type: String,
      trim: true,
      default: null
    },

    socialLinks: {
      type: socialLinksSchema,
      default: () => ({})
    },

    // DJ fields
    stageName: {
      type: String,
      trim: true,
      default: null,
      index: true
    },

    genres: {
      type: [String],
      enum: GENRES,
      default: []
    },

    customGenre: {
      type: String,
      trim: true,
      default: null
    },

    shortBio: {
      type: String,
      trim: true,
      default: null
    },

    yearsOfExperience: {
      type: Number,
      min: 0,
      default: null
    },

    typicalRatePerSetUsd: {
      type: Number,
      min: 0,
      default: null
    },

    openToTravel: {
      type: String,
      enum: TRAVEL_OPTIONS,
      default: null
    },

    // Customer fields
    eventType: {
      type: String,
      enum: EVENT_TYPES,
      default: null
    },

    eventTypeOther: {
      type: String,
      trim: true,
      default: null
    },

    eventDate: {
      type: Date,
      default: null,
      index: true
    },

    budgetRange: {
      type: String,
      trim: true,
      default: null
    },

    preferredGenres: {
      type: [String],
      enum: GENRES,
      default: []
    },

    preferredCustomGenre: {
      type: String,
      trim: true,
      default: null
    },

    additionalInfo: {
      type: String,
      trim: true,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Waitlist', waitlistSchema);