import { ServiceDisplay, ServiceGroupDisplay } from '@shared/schema';

// Extend Window interface to include Clerk's properties
declare global {
  interface Window {
    __clerk_frontend_api?: {
      getToken: (options?: { template?: string }) => Promise<string>;
      [key: string]: any;
    };
  }
}

// API endpoints
const API_BASE_URL = '/api'; // Always use relative API path to avoid CORS

// Generic fetch wrapper with error handling
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    // Clone the response to avoid "body stream already read" errors
    const responseClone = response.clone();

    if (!response.ok) {
      // Get the content type to determine how to process the error
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        // For JSON error responses
        try {
          const errorData = await responseClone.json();
          throw new Error(errorData.message || `API error: ${response.status}`);
        } catch (parseError) {
          // If JSON parsing fails, use a generic error message
          throw new Error(`API error: ${response.status}`);
        }
      } else {
        // For non-JSON error responses
        try {
          const errorText = await responseClone.text();
          if (errorText.includes('<!DOCTYPE html>')) {
            throw new Error(`API returned HTML instead of JSON. Status: ${response.status}`);
          } else {
            throw new Error(`API error: ${response.status}. ${errorText.substring(0, 100)}`);
          }
        } catch (textError) {
          // If text reading fails, use a generic error message
          throw new Error(`API error: ${response.status}`);
        }
      }
    }

    // For successful responses
    try {
      return await responseClone.json();
    } catch (jsonError) {
      throw new Error(`Invalid JSON response from API: ${endpoint}`);
    }
  } catch (error) {
    console.error(`API fetch error: ${endpoint}`, error);
    throw error;
  }
}

// ----- Services API -----
export async function getServices(): Promise<ServiceDisplay[]> {
  return fetchAPI<ServiceDisplay[]>('/services');
}

export async function getServiceBySlug(slug: string): Promise<ServiceDisplay> {
  return fetchAPI<ServiceDisplay>(`/services?slug=${slug}`);
}

// ----- Service Groups API -----
export async function getServiceGroups(): Promise<ServiceGroupDisplay[]> {
  return fetchAPI<ServiceGroupDisplay[]>('/service-groups');
}

export async function getServiceGroupBySlug(slug: string): Promise<ServiceGroupDisplay & { services: ServiceDisplay[] }> {
  return fetchAPI<ServiceGroupDisplay & { services: ServiceDisplay[] }>(`/service-groups?slug=${slug}`);
}

// ----- Booking API -----
export async function createBooking(bookingData: any): Promise<any> {
  return fetchAPI('/booking', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
}

export async function getAvailableTimeSlots(date: string, serviceId?: number): Promise<{ availableSlots: string[] }> {
  // Format query string carefully to avoid issues
  const queryParams = new URLSearchParams();
  queryParams.append('date', date);
  if (serviceId !== undefined && serviceId !== null) {
    queryParams.append('serviceId', serviceId.toString());
  }

  try {
    // Prefer the time-slots endpoint as it's more reliable
    const response = await fetchAPI<{ availableSlots: string[] }>(`/time-slots?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.log('Time-slots endpoint failed, falling back to appointments endpoint');
    try {
      // Fall back to the appointments endpoint
      return await fetchAPI<{ availableSlots: string[] }>(`/appointments?${queryParams.toString()}`);
    } catch (fallbackError) {
      console.error('Both endpoints failed:', fallbackError);
      // Return empty slots when all APIs fail to prevent UI errors
      return { availableSlots: [] };
    }
  }
}

export async function checkAppointment(email: string, appointmentId: number): Promise<any> {
  return fetchAPI('/appointments', {
    method: 'POST',
    body: JSON.stringify({ email, appointmentId, action: 'check' }),
  });
}

export async function updateAppointment(id: number, email: string, status: string): Promise<any> {
  return fetchAPI('/appointments', {
    method: 'PUT',
    body: JSON.stringify({ id, email, status }),
  });
}

// ----- Contact API -----
export async function submitContactForm(contactData: any): Promise<any> {
  return fetchAPI('/contact', {
    method: 'POST',
    body: JSON.stringify(contactData),
  });
}

// ----- Memberships API -----
export async function getMemberships(): Promise<any[]> {
  return fetchAPI<any[]>('/memberships');
}

export async function getMembershipByTier(tier: string): Promise<any> {
  return fetchAPI<any>(`/memberships?tier=${tier}`);
}

// ----- Admin API -----
// Helper function for admin endpoints to ensure correct URL structure
export async function fetchAdminAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Remove any leading slash from the endpoint
    const trimmedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // Make sure we have the right headers for admin requests
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    
    try {
      // First, directly access the active Clerk session if available
      // This should be the most reliable method
      if (typeof window !== 'undefined') {
        // Try the modern Clerk API first
        if (window.Clerk?.session) {
          try {
            const token = await window.Clerk.session.getToken();
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
              console.log('Auth token retrieved from Clerk.session');
            }
          } catch (sessionError) {
            console.warn('Error accessing Clerk.session:', sessionError);
          }
        } 
        // Fallback to the internal API if necessary
        else if (window.__clerk_frontend_api?.getToken) {
          try {
            const token = await window.__clerk_frontend_api.getToken();
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
              console.log('Auth token retrieved from internal API');
            }
          } catch (internalError) {
            console.warn('Error accessing internal Clerk API:', internalError);
          }
        } else {
          console.warn('No Clerk session available. Authentication will fail for admin routes.');
        }
      }
    } catch (tokenError) {
      console.error('Failed to get auth token:', tokenError);
    }
    
    // Form the admin endpoint - ALWAYS use the standard relative path approach
    // This ensures your API requests stay on the same domain
    const fullEndpoint = `/api/admin/${trimmedEndpoint}`;
    
    // In production, add explicit debugging
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      console.log(`Admin API request to: ${fullEndpoint}`);
      console.log(`Auth header present: ${headers['Authorization'] ? 'Yes' : 'No'}`);
    }
    
    // Make a direct fetch request with our custom headers instead of using fetchAPI
    // This gives us more control over the exact request configuration
    const response = await fetch(fullEndpoint, {
      ...options,
      headers,
    });
    
    // Handle response manually (similar to fetchAPI but with more debug info)
    if (!response.ok) {
      // Try to get more diagnostic information
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        // For JSON error responses, get the error details
        const errorData = await response.json();
        throw new Error(errorData.message || `Admin API error: ${response.status}`);
      } else {
        // For non-JSON responses, log more details in production
        try {
          const errorText = await response.text();
          console.error(`Admin API returned non-JSON response: ${errorText.substring(0, 200)}`);
          throw new Error(`Admin API error: ${response.status} - Non-JSON response`);
        } catch (textError) {
          throw new Error(`Admin API error: ${response.status}`);
        }
      }
    }
    
    // For successful responses
    try {
      const data = await response.json();
      return data as T;
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      throw new Error(`Invalid JSON response from Admin API: ${trimmedEndpoint}`);
    }
  } catch (error) {
    console.error(`Admin API fetch error (${endpoint}):`, error);
    throw error;
  }
}
