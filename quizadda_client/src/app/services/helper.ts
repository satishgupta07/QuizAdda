import { environment } from '../../environments/environment';

/**
 * Single source of truth for the backend base URL.
 * <p>
 * Services import this rather than reading {@link environment} directly so
 * changing the URL (or wrapping it with auth/path prefixes) only needs one edit.
 * The actual value comes from {@code environment.ts} (dev) or
 * {@code environment.prod.ts} (production, swapped at build time).
 */
const baseUrl = environment.apiUrl;

export default baseUrl;
