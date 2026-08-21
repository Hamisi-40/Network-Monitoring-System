/**
 * Change this single value when the Express backend is deployed.
 * Components never repeat backend URLs directly.
 */
export const API_BASE_URL = 'http://localhost:4000';

/**
 * When true, the packages page uses clearly separated demo data if the API
 * cannot be reached. Set to false before production if fallback is unwanted.
 */
export const USE_PACKAGE_FALLBACK = false;

/** Five seconds keeps payment checks responsive without overwhelming the API. */
export const PAYMENT_POLL_INTERVAL_MS = 5_000;
export const MAX_PAYMENT_POLLS = 24;

