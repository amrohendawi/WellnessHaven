import { ServiceDisplay, ServiceGroupDisplay } from '@shared/schema';

// Extend Window interface to include Clerk's properties
declare global {
  interface Window {
    __clerk_frontend_api?: {
      getToken: (options?: { template?: string }) => Promise<string>;
      [key: string]: any;
    };
    Clerk?: {
      session: {
        getToken: (options?: any) => Promise<string>;
      };
      [key: string]: any;
    };
  }
}

// Define common response types for better type safety
export interface ApiResponse {
  success: boolean;
  message?: string;
}

export interface BookingResponse extends ApiResponse {
  bookingId?: number;
  confirmationCode?: string;
}

export interface TimeSlotResponse {
  availableSlots: string[];
}

/**
 * Environment detection utility
 * Uses multiple methods to reliably determine the current environment
 */
export const environment = {
  isDevelopment: (): boolean => {
    // Check multiple environment indicators
    return (
      // Standard environment variables
      process.env.NODE_ENV === 'development' ||
      // Hostname checks
      (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.includes('.local')))
    );
  },

  isProduction: (): boolean => {
    return (
      process.env.NODE_ENV === 'production' ||
      (typeof window !== 'undefined' &&
        (window.location.hostname.includes('dubai-rose.vercel.app') ||
          window.location.hostname.includes('dubai-rose-spa.vercel.app') ||
          !environment.isDevelopment()))
    );
  },

  // Get the current domain for absolute URL construction when needed
  getCurrentDomain: (): string => {
    if (typeof window === 'undefined') return '';
    return `${window.location.protocol}//${window.location.host}`;
  },

  // Get API base URL - use absolute paths in production to handle cross-origin issues
  getApiBaseUrl: (): string => {
    if (environment.isDevelopment()) {
      return '/api'; // Relative path works fine in development
    } else {
      // Production - use absolute URL to the API domain
      // This resolves cross-origin issues identified in past deployments
      const host = typeof window !== 'undefined' ? window.location.host : '';
      if (host.includes('dubai-rose.vercel.app')) {
        return 'https://dubai-rose.vercel.app/api';
      } else {
        return '/api'; // Default fallback
      }
    }
  },
};

// API endpoints base URL - dynamically determined based on environment
const API_BASE_URL = environment.getApiBaseUrl();

/**
 * Logger utility that adjusts verbosity based on environment
 */
export const logger = {
  // Production-safe debug logging
  debug: (message: string, ...args: any[]): void => {
    if (environment.isDevelopment()) {
      console.log(`🔍 ${message}`, ...args);
    }
  },

  // Info logging - used in both production and development
  info: (message: string, ...args: any[]): void => {
    if (environment.isDevelopment() || localStorage.getItem('enableDetailedLogs') === 'true') {
      console.info(`ℹ️ ${message}`, ...args);
    }
  },

  // Warning logs - used in both environments but limited in production
  warn: (message: string, ...args: any[]): void => {
    console.warn(`⚠️ ${message}`, ...args);
  },

  // Error logs - always shown but with different detail levels
  error: (message: string, error?: any): void => {
    if (environment.isDevelopment()) {
      console.error(`❌ ${message}`, error);
    } else {
      // In production, limit error details to avoid leaking sensitive info
      console.error(`❌ ${message}`, error instanceof Error ? error.message : 'An error occurred');
    }
  },
};

/**
 * Custom API error class for better error handling
 */
export class ApiError extends Error {
  status: number;
  endpoint: string;
  details?: any;

  constructor(message: string, status: number, endpoint: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
    this.details = details;

    // Maintains proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Generic fetch wrapper with enhanced error handling, retry logic, and security
 * @param endpoint The API endpoint to call
 * @param options Fetch options
 * @returns Promise with typed response
 */
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit & { retry?: number; retryDelay?: number } = {}
): Promise<T> {
  // Extract and remove custom options
  const { retry = 0, retryDelay = 1000, ...fetchOptions } = options;
  const retryCount = Math.max(0, Math.min(retry, 3)); // Limit retries between 0-3

  try {
    // Always add security headers for all requests
    const headers = new Headers(fetchOptions.headers);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Add CSRF protection as needed
    const csrfToken = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (csrfToken && csrfToken[1]) {
      headers.set('X-XSRF-TOKEN', csrfToken[1]);
    }

    // Log request in development only
    logger.debug(`API Request to: ${API_BASE_URL}${endpoint}`);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // Clone the response to avoid "body stream already read" errors
    const responseClone = response.clone();

    if (!response.ok) {
      // Get the content type to determine how to process the error
      const contentType = response.headers.get('content-type');

      let errorMessage: string;
      let errorDetails: any = null;

      if (contentType && contentType.includes('application/json')) {
        // For JSON error responses
        try {
          const errorData = await responseClone.json();
          errorMessage = errorData.message || `API error: ${response.status}`;
          errorDetails = errorData;
        } catch (parseError) {
          // If JSON parsing fails, use a generic error message
          errorMessage = `API error: ${response.status}`;
        }
      } else {
        // For non-JSON error responses
        try {
          const errorText = await responseClone.text();
          if (errorText.includes('<!DOCTYPE html>')) {
            errorMessage = `API returned HTML instead of JSON. Status: ${response.status}`;
          } else {
            errorMessage = `API error: ${response.status}. ${errorText.substring(0, 100)}`;
          }
        } catch (textError) {
          // If text reading fails, use a generic error message
          errorMessage = `API error: ${response.status}`;
        }
      }

      // Create a custom error with additional metadata
      const apiError = new ApiError(errorMessage, response.status, endpoint, errorDetails);

      // If we should retry and have retries left
      if (retryCount > 0 && [408, 429, 500, 502, 503, 504].includes(response.status)) {
        logger.warn(`Retrying failed request to ${endpoint}. Attempts left: ${retryCount}`);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));

        // Retry with one less retry attempt
        return fetchAPI<T>(endpoint, {
          ...options,
          retry: retryCount - 1,
          retryDelay: retryDelay * 1.5, // Exponential backoff
        });
      }

      throw apiError;
    }

    // For successful responses
    try {
      return await responseClone.json();
    } catch (jsonError) {
      throw new ApiError(`Invalid JSON response from API: ${endpoint}`, 0, endpoint);
    }
  } catch (error) {
    // Only log detailed errors in development
    if (error instanceof ApiError) {
      logger.error(`API error: ${endpoint}`, error);
    } else {
      logger.error(`API fetch error: ${endpoint}`, error);
    }
    throw error;
  }
}

/**
 * Type definitions for API request bodies
 */
export interface BookingData {
  name: string;
  email: string;
  phone: string;
  service: number;
  serviceSlug: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
  duration: number;
  vipNumber?: string;
}

// ----- Services API with caching -----
let cachedServices: ServiceDisplay[] | null = null;
let servicesLastFetched = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get all services with caching
 */
export async function getServices(): Promise<ServiceDisplay[]> {
  // Check if we have cached data that's still fresh
  const now = Date.now();
  if (cachedServices && now - servicesLastFetched < CACHE_TTL) {
    logger.debug('Using cached services');
    return cachedServices;
  }

  try {
    // Fetch fresh data with retries enabled
    const services = await fetchAPI<ServiceDisplay[]>('/services', { retry: 2 });
    // Update cache
    cachedServices = services;
    servicesLastFetched = now;
    return services;
  } catch (error) {
    // If we have stale cache, return it on error rather than failing
    if (cachedServices) {
      logger.warn('Failed to fetch fresh services, using stale cache');
      return cachedServices;
    }
    throw error;
  }
}

/**
 * Get service by slug
 */
export async function getServiceBySlug(slug: string): Promise<ServiceDisplay> {
  // Try to find in cache first to avoid an extra API call
  if (cachedServices) {
    const cached = cachedServices.find(s => s.slug === slug);
    if (cached) {
      logger.debug(`Using cached service for slug: ${slug}`);
      return cached;
    }
  }

  return fetchAPI<ServiceDisplay>(`/services?slug=${encodeURIComponent(slug)}`, { retry: 1 });
}

// ----- Service Groups API with similar caching -----
let cachedServiceGroups: ServiceGroupDisplay[] | null = null;
let groupsLastFetched = 0;

/**
 * Get all service groups with caching
 */
export async function getServiceGroups(): Promise<ServiceGroupDisplay[]> {
  // Check cache freshness
  const now = Date.now();
  if (cachedServiceGroups && now - groupsLastFetched < CACHE_TTL) {
    logger.debug('Using cached service groups');
    return cachedServiceGroups;
  }

  try {
    const groups = await fetchAPI<ServiceGroupDisplay[]>('/service-groups', { retry: 2 });
    cachedServiceGroups = groups;
    groupsLastFetched = now;
    return groups;
  } catch (error) {
    if (cachedServiceGroups) {
      logger.warn('Failed to fetch fresh service groups, using stale cache');
      return cachedServiceGroups;
    }
    throw error;
  }
}

/**
 * Get service group by slug with included services
 */
export async function getServiceGroupBySlug(
  slug: string
): Promise<ServiceGroupDisplay & { services: ServiceDisplay[] }> {
  // Could add caching optimization here too
  return fetchAPI<ServiceGroupDisplay & { services: ServiceDisplay[] }>(
    `/service-groups?slug=${encodeURIComponent(slug)}`,
    { retry: 1 }
  );
}

// ----- Booking API -----
/**
 * Create a new booking
 */
export async function createBooking(bookingData: BookingData): Promise<BookingResponse> {
  return fetchAPI<BookingResponse>('/booking', {
    method: 'POST',
    body: JSON.stringify(bookingData),
    retry: 2, // Important endpoint, add retry logic
    retryDelay: 1500, // Longer delay for this critical operation
  });
}

/**
 * Helper function to generate mock time slots for development/testing
 * Uses deterministic logic for consistent testing experience
 */
function generateMockTimeSlots(dateString: string): string[] {
  const date = new Date(dateString);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const currentHour = today.getHours();

  // Base set of time slots
  let slots = [
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
  ];

  // If today, filter out past time slots
  if (isToday) {
    slots = slots.filter(slot => {
      const [hours] = slot.split(':').map(Number);
      return hours > currentHour;
    });
  }

  // Use date components for deterministic "random" removal
  // This ensures the same date always shows the same slots
  const day = date.getDate();
  const month = date.getMonth() + 1;

  // Create a pattern of availability that's consistent for the same date
  return slots.filter((_, index) => {
    // Use a hash-like approach for deterministic filtering
    const shouldKeep = (index * day + month) % 10 > 3; // Keep ~70% of slots
    return shouldKeep;
  });
}

/**
 * Custom fetchAPI wrapper for time slots specifically to reduce error logging
 */
async function fetchTimeSlotsAPI<T>(
  endpoint: string,
  options: RequestInit & { retry?: number; retryDelay?: number } = {}
): Promise<T> {
  try {
    return await fetchAPI<T>(endpoint, options);
  } catch (error) {
    // Don't log this as an error - it's an expected failure for time slots
    // These expected errors are too noisy in the console
    if (error instanceof ApiError) {
      // Downgrade from error to info level for expected failure
      logger.info(`Time slots API issue: ${endpoint}`);
    }
    throw error; // Still throw so caller can handle
  }
}

/**
 * Get available time slots for a date and optional service
 * Gracefully handle API failures with fallbacks
 */
export async function getAvailableTimeSlots(
  date: string,
  serviceId?: number
): Promise<TimeSlotResponse> {
  // Format query string carefully to avoid issues and potential injection
  const queryParams = new URLSearchParams();
  queryParams.append('date', date);
  if (serviceId !== undefined && serviceId !== null) {
    queryParams.append('serviceId', serviceId.toString());
  }

  // Use deterministic approach for development mode to avoid random behavior
  // This helps with consistent testing
  const useRealAPI =
    environment.isProduction() ||
    (environment.isDevelopment() && localStorage.getItem('forceRealAPI') === 'true');

  // For development, sometimes use mock data immediately if the API is known to be unavailable
  if (!useRealAPI && Math.random() > 0.3) {
    logger.debug('Using mock time slots directly (development mode)');
    return { availableSlots: generateMockTimeSlots(date) };
  }

  // Try real API endpoints with graceful fallback
  try {
    // Try the time-slots endpoint first with retry logic
    logger.debug(`Fetching time slots for date: ${date}, service: ${serviceId || 'any'}`);
    try {
      const response = await fetchTimeSlotsAPI<TimeSlotResponse>(
        `/time-slots?${queryParams.toString()}`,
        {
          retry: 1,
          retryDelay: 800,
        }
      );
      return response;
    } catch (error) {
      // Quietly log without console error noise
      logger.info('Time-slots endpoint failed, falling back to appointments endpoint');

      try {
        // Fall back to the appointments endpoint, also with retry
        const fallbackResponse = await fetchTimeSlotsAPI<TimeSlotResponse>(
          `/appointments?${queryParams.toString()}`,
          {
            retry: 1,
          }
        );
        return fallbackResponse;
      } catch (fallbackError) {
        // Both endpoints failed, which is expected in development
        logger.info('Both API endpoints failed, using generated time slots');
        throw new Error('Both endpoints failed'); // Force fallback
      }
    }
  } catch (error) {
    // Fallback to generated time slots - this is expected behavior
    // so we don't need to log it as an error
    return { availableSlots: generateMockTimeSlots(date) };
  }
}

// ----- Appointment API -----
export interface AppointmentCheckRequest {
  email: string;
  appointmentId: number;
  action: 'check';
}

export interface AppointmentUpdateRequest {
  id: number;
  email: string;
  status: string;
}

export interface AppointmentResponse extends ApiResponse {
  appointment?: {
    id: number;
    date: string;
    time: string;
    status: string;
    service: string;
  };
}

export async function checkAppointment(
  email: string,
  appointmentId: number
): Promise<AppointmentResponse> {
  return fetchAPI<AppointmentResponse>('/appointments', {
    method: 'POST',
    body: JSON.stringify({ email, appointmentId, action: 'check' } as AppointmentCheckRequest),
    retry: 1,
  });
}

export async function updateAppointment(
  id: number,
  email: string,
  status: string
): Promise<AppointmentResponse> {
  return fetchAPI<AppointmentResponse>('/appointments', {
    method: 'PUT',
    body: JSON.stringify({ id, email, status } as AppointmentUpdateRequest),
    retry: 1,
  });
}

// ----- Contact API -----
export interface ContactData {
  name: string;
  email: string;
  message: string;
  phone?: string;
  subject?: string;
}

export async function submitContactForm(contactData: ContactData): Promise<ApiResponse> {
  return fetchAPI<ApiResponse>('/contact', {
    method: 'POST',
    body: JSON.stringify(contactData),
    retry: 1,
  });
}

// ----- Memberships API -----
export interface Membership {
  id: number;
  tier: string;
  name: {
    en: string;
    de: string;
    ar: string;
    tr: string;
    [key: string]: string;
  };
  discount: number;
  description?: {
    en: string;
    de: string;
    ar: string;
    tr: string;
    [key: string]: string;
  };
  features: string[];
}

export async function getMemberships(): Promise<Membership[]> {
  return fetchAPI<Membership[]>('/memberships', { retry: 1 });
}

export async function getMembershipByTier(tier: string): Promise<Membership> {
  return fetchAPI<Membership>(`/memberships?tier=${encodeURIComponent(tier)}`, { retry: 1 });
}

// ----- Admin API -----
/**
 * Helper function for admin endpoints with enhanced error handling and CORS support
 * Incorporates fixes identified in past deployments for cross-origin and authentication issues
 */
export async function fetchAdminAPI<T>(
  endpoint: string,
  options: RequestInit & { retry?: number; retryDelay?: number } = {}
): Promise<T> {
  // Extract custom options
  const { retry = 1, retryDelay = 1000, ...fetchOptions } = options;
  const retryCount = Math.max(0, Math.min(retry, 3)); // Limit retries

  try {
    // Remove any leading slash from the endpoint for consistency
    const trimmedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    // Prepare headers with security and content-type settings
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((fetchOptions.headers as Record<string, string>) || {}),
    };

    // Handle cross-origin API URLs based on the deployment configuration
    // This addresses the issue identified in the CORS memory where admin API calls
    // needed to use absolute URLs in production environments
    let apiUrl: string;

    if (environment.isProduction()) {
      // In production, use same-domain API requests to avoid CORS issues
      // Each deployment (dubai-rose and dubai-rose-spa) should use its own /api routes
      const host = typeof window !== 'undefined' ? window.location.host : '';
      
      // Always use same-domain API calls to prevent CORS issues
      // Use the regular admin endpoint which now has all functionality consolidated
      apiUrl = `/api/admin/${trimmedEndpoint}`;
      logger.debug(`Using admin API URL: ${apiUrl} (host: ${host})`);
    } else {
      // In development, use relative paths to the original API endpoints
      // This allows development to continue using the Express server
      apiUrl = `${API_BASE_URL}/admin/${trimmedEndpoint}`;
    }

    // Debug logging for API requests
    logger.debug(`Admin API request to: ${apiUrl}`);

    try {
      // Make a direct fetch call with proper CORS settings
      const response = await fetch(apiUrl, {
        ...fetchOptions,
        headers,
        // Ensure CORS credentials are included for cross-origin requests
        credentials: 'include',
      });

      // Process the response
      if (response.status === 204) {
        // 204 No Content is a successful response, often used for DELETE operations
        // Just return an empty object since there is no content
        logger.debug(`Successful 204 No Content response from ${apiUrl}`);
        return {} as T;
      }
      
      if (!response.ok) {
        // Handle error response
        const contentType = response.headers.get('content-type');
        let errorMessage: string;
        let errorDetails: any = null;

        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || `Admin API error: ${response.status}`;
            errorDetails = errorData;
          } catch (jsonError) {
            errorMessage = `Admin API error: ${response.status}`;
          }
        } else {
          try {
            const errorText = await response.text();
            if (errorText.includes('<!DOCTYPE html>')) {
              // HTML error typically means routing/authentication issue
              errorMessage = `Admin API returned HTML instead of JSON. Status: ${response.status}`;
              logger.error(
                'Received HTML instead of JSON. This suggests a routing or authentication issue.'
              );
            } else {
              errorMessage = `Admin API error: ${response.status}. ${errorText.substring(0, 100)}`;
            }
          } catch (textError) {
            errorMessage = `Admin API error: ${response.status}`;
          }
        }

        // Create custom error with metadata
        const apiError = new ApiError(errorMessage, response.status, endpoint, errorDetails);

        // Handle retry for specific status codes
        if (retryCount > 0 && [408, 429, 500, 502, 503, 504].includes(response.status)) {
          logger.warn(`Retrying failed admin request to ${endpoint}. Attempts left: ${retryCount}`);

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));

          // Retry with one less retry attempt
          return fetchAdminAPI<T>(endpoint, {
            ...options,
            retry: retryCount - 1,
            retryDelay: retryDelay * 1.5, // Exponential backoff
          });
        }

        // Handle authentication errors
        if (response.status === 401) {
          // Clear the auth state and redirect to login
          if (typeof window !== 'undefined') {
            // Clear any auth state
            localStorage.removeItem('authState');

            // Redirect to login page
            window.location.href = '/admin/login';
          }
        }

        throw apiError;
      }

      // Process successful response
      try {
        return (await response.json()) as T;
      } catch (jsonError) {
        throw new ApiError(`Invalid JSON response from Admin API: ${endpoint}`, 0, endpoint);
      }
    } catch (fetchError) {
      // Add specific diagnostics for production debugging
      if (environment.isProduction()) {
        logger.error(`Admin API call failed for: ${trimmedEndpoint}`);

        if (fetchError instanceof ApiError) {
          if (fetchError.message.includes('HTML instead of JSON')) {
            logger.error(
              'Received HTML instead of JSON suggests a routing issue or authentication failure. ' +
                'This typically happens when the API gateway serves the frontend instead of the API.'
            );
          }
        }
      }
      throw fetchError;
    }
  } catch (error) {
    logger.error(`Admin API error (${endpoint})`, error);
    throw error;
  }
}
