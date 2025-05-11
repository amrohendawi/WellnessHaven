import { ServiceDisplay, ServiceGroupDisplay } from '@shared/schema';

// API endpoints
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://dubai-rose-spa.vercel.app/api' // Dubai Rose vercel deployment URL
  : '/api'; // Use relative paths in development

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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return await response.json();
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
  const queryParams = serviceId ? `?date=${date}&serviceId=${serviceId}` : `?date=${date}`;
  return fetchAPI<{ availableSlots: string[] }>(`/appointments${queryParams}`);
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
