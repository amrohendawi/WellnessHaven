import { QueryClient, QueryFunction } from '@tanstack/react-query';
import * as api from './api';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {
  // Base API URL for Vercel deployment
  const API_BASE_URL =
    process.env.NODE_ENV === 'production'
      ? 'https://dubai-rose-git-main-amrohendawis-projects.vercel.app' // Dubai Rose vercel deployment URL
      : '';

  // Prepare the full URL for the fetch request
  const fullUrl = url.startsWith('/api') ? `${API_BASE_URL}${url}` : url;

  const res = await fetch(fullUrl, {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = 'returnNull' | 'throw';
export const getQueryFn =
  <T>({ on401: unauthorizedBehavior }: { on401: UnauthorizedBehavior }): QueryFunction<T> =>
  async ({ queryKey }) => {
    // Handle special query keys that should use API functions
    const [path, ...params] = queryKey as [string, ...any[]];

    if (path === '/api/services' && params.length === 0) {
      return api.getServices() as unknown as T;
    }

    if (path === '/api/services' && params.length === 1) {
      return api.getServiceBySlug(params[0]) as unknown as T;
    }

    if (path === '/api/service-groups' && params.length === 0) {
      return api.getServiceGroups() as unknown as T;
    }

    if (path === '/api/service-groups' && params.length === 1) {
      return api.getServiceGroupBySlug(params[0]) as unknown as T;
    }

    if (path === '/api/memberships') {
      return api.getMemberships() as unknown as T;
    }

    // Fall back to the original implementation for other paths
    const res = await fetch(path as string, {
      credentials: 'include',
    });

    if (unauthorizedBehavior === 'returnNull' && res.status === 401) {
      return null as unknown as T;
    }

    await throwIfResNotOk(res);
    return (await res.json()) as T;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: 'throw' }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
