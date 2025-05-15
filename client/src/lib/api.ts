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
const API_BASE_URL = '/api'; // Always use relative API path - works for both admin and regular endpoints

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
    
    // Get authentication token - simplify and focus on the most reliable approach
    if (typeof window !== 'undefined') {
      try {
        // Modern approach - access Clerk from window with proper typing
        // Using type assertion since TypeScript doesn't know about Clerk on window by default
        const Clerk = (window as any).Clerk;
        
        // Check if Clerk is available and user is signed in
        if (Clerk && Clerk.session) {
          console.log('Clerk session found, getting token...');
          const token = await Clerk.session.getToken();
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('✅ Auth token successfully retrieved');
          } else {
            console.warn('⚠️ Token is null or empty');
          }
        } else {
          console.warn('⚠️ No active Clerk session found - user may not be logged in');
        }
      } catch (err) {
        console.error('❌ Error getting auth token:', err);
      }
    }
    
    // Form the admin endpoint path - keep it simple just like regular API calls
    const adminPath = `/admin/${trimmedEndpoint}`;
    
    // Debug logging
    if (typeof window !== 'undefined') {
      console.log(`📡 Admin API request to: ${API_BASE_URL}${adminPath}`);
      console.log(`🔑 Auth header present: ${headers['Authorization'] ? 'Yes' : 'No'}`);
    }
    
    // Use the standard fetchAPI function with our custom auth headers
    // This ensures consistency with the working API calls
    try {
      return await fetchAPI<T>(adminPath, { ...options, headers });
    } catch (error) {
      // Add specific logging for production debugging
      if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
        console.error(`Admin API call failed for: ${adminPath}`);
        console.error(`Error details:`, error);
        
        // Provide more specific error messages in production
        if (error instanceof Error) {
          if (error.message.includes('Invalid JSON')) {
            console.error('This may indicate an authentication issue or server error');
            if (!headers['Authorization']) {
              console.error('IMPORTANT: No authentication token was provided. Check if you are logged in.');
            }
          }
        }
      }
      throw error;
    }
  } catch (error) {
    console.error(`Admin API fetch error (${endpoint}):`, error);
    throw error;
  }
}
