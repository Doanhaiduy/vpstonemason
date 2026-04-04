const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://pvstone.com.au/api';
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || PUBLIC_API_URL;
const API_URL = typeof window === 'undefined' ? INTERNAL_API_URL : PUBLIC_API_URL;

interface FetchOptions extends RequestInit {
  token?: string;
}

async function tryRefreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return null;
  }

  const data = await res.json();
  if (!data?.accessToken) return null;

  localStorage.setItem('accessToken', data.accessToken);
  return data.accessToken;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const makeRequest = (authToken?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });
  };

  let res = await makeRequest(token);

  const isAuthEndpoint = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/refresh');
  if (res.status === 401 && token && !isAuthEndpoint) {
    const newAccessToken = await tryRefreshAccessToken();
    if (newAccessToken) {
      res = await makeRequest(newAccessToken);
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `API Error: ${res.status}`);
  }

  return res.json();
}

// Public API helpers
export const api = {
  // Showroom
  getShowroomSettings: () => fetchApi<any>('/showroom'),

  // Projects
  getProjects: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<{ data: any[]; pagination: any }>(`/projects${query}`);
  },
  getProjectBySlug: (slug: string) => fetchApi<any>(`/projects/${slug}`),
  getFeaturedProjects: (limit = 4) => fetchApi<any[]>(`/projects/featured?limit=${limit}`),

  // Blog
  getBlogPosts: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<{ data: any[]; pagination: any }>(`/blog-posts${query}`);
  },
  getBlogPostBySlug: (slug: string) => fetchApi<any>(`/blog-posts/${slug}`),

  // Enquiries
  submitEnquiry: (data: any) =>
    fetchApi<{ message: string; id: string }>('/enquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Catalog (3-tier: category → range → product)
  getCatalogCategories: () => fetchApi<any[]>('/catalog'),
  getCatalogTree: () => fetchApi<any[]>('/catalog/tree'),
  getCatalogItem: (slug: string) => fetchApi<any>(`/catalog/${slug}`),
  getCatalogChildren: (slug: string) => fetchApi<any[]>(`/catalog/${slug}/children`),
  getCatalogBreadcrumb: (slug: string) => fetchApi<any[]>(`/catalog/${slug}/breadcrumb`),
};

// Admin API helpers
export const adminApi = {
  login: (email: string, password: string) =>
    fetchApi<{ accessToken: string; refreshToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refreshToken: string) =>
    fetchApi<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  getMe: (token: string) => fetchApi<{ user: any }>('/auth/me', { token }),

  // Catalog Admin CRUD
  getCatalogItems: (token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<{ data: any[]; pagination: any }>(`/catalog/admin/items${query}`, { token });
  },
  getCatalogTree: (token: string) => fetchApi<any[]>('/catalog/admin/tree', { token }),
  getCatalogItemById: (token: string, id: string) =>
    fetchApi<{ item: any; children: any[] }>(`/catalog/admin/item/${id}`, { token }),
  createCatalogItem: (token: string, data: any) =>
    fetchApi<any>('/catalog/admin/items', { method: 'POST', body: JSON.stringify(data), token }),
  updateCatalogItem: (token: string, id: string, data: any) =>
    fetchApi<any>(`/catalog/admin/item/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),
  deleteCatalogItem: (token: string, id: string) =>
    fetchApi<any>(`/catalog/admin/item/${id}`, { method: 'DELETE', token }),

  // Projects CRUD
  getProjects: (token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<{ data: any[]; pagination: any }>(`/projects/admin${query}`, { token });
  },
  getProjectById: (token: string, id: string) => fetchApi<any>(`/projects/admin/${id}`, { token }),
  createProject: (token: string, data: any) =>
    fetchApi<any>('/projects', { method: 'POST', body: JSON.stringify(data), token }),
  updateProject: (token: string, id: string, data: any) =>
    fetchApi<any>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),
  deleteProject: (token: string, id: string) =>
    fetchApi<any>(`/projects/${id}`, { method: 'DELETE', token }),

  // Enquiries
  getEnquiries: (token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<{ data: any[]; pagination: any }>(`/enquiries${query}`, { token });
  },
  getEnquiry: (token: string, id: string) =>
    fetchApi<any>(`/enquiries/${id}`, { token }),
  updateEnquiry: (token: string, id: string, data: any) =>
    fetchApi<any>(`/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),

  // Blog CRUD
  getBlogPosts: (token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<{ data: any[]; pagination: any }>(`/blog-posts/admin/all${query}`, { token });
  },
  getBlogPostById: (token: string, id: string) => fetchApi<any>(`/blog-posts/admin/${id}`, { token }),
  createBlogPost: (token: string, data: any) =>
    fetchApi<any>('/blog-posts', { method: 'POST', body: JSON.stringify(data), token }),
  updateBlogPost: (token: string, id: string, data: any) =>
    fetchApi<any>(`/blog-posts/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),
  deleteBlogPost: (token: string, id: string) =>
    fetchApi<any>(`/blog-posts/${id}`, { method: 'DELETE', token }),

  // Showroom Settings
  getSettings: (token: string) => fetchApi<any>('/showroom', { token }),
  updateSettings: (token: string, data: any) =>
    fetchApi<any>('/showroom', { method: 'PATCH', body: JSON.stringify(data), token }),

  // Users (admin account management)
  getUsers: (token: string) => fetchApi<any[]>('/users', { token }),
  createUser: (
    token: string,
    data: { email: string; password: string; firstName: string; lastName: string },
  ) => fetchApi<any>('/users', { method: 'POST', body: JSON.stringify(data), token }),
  updateUser: (token: string, id: string, data: any) =>
    fetchApi<any>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),
  deleteUser: (token: string, id: string) =>
    fetchApi<any>(`/users/${id}`, { method: 'DELETE', token }),
};
