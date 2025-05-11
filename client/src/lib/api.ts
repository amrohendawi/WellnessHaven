import { ServiceDisplay, ServiceGroupDisplay } from '@shared/schema';

// API endpoints
const API_BASE_URL = '/api'; // Always use relative API path to avoid CORS

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
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

    if (!response.ok) {
      try {
        // Try to parse as JSON first
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      } catch (jsonError) {
        // If JSON parsing fails, get text instead
        const errorText = await response.text();
        if (errorText.includes('<!DOCTYPE html>')) {
          throw new Error(`API returned HTML instead of JSON. Status: ${response.status}`);
        } else {
          throw new Error(`API error: ${response.status}. ${errorText.substring(0, 100)}`);
        }
      }
    }

    try {
      return await response.json();
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
