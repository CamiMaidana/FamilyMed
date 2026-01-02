const API_URL = import.meta.env.VITE_API_URL;

type Json = Record<string, any>;

export function getToken(): string | null {
  return sessionStorage.getItem('accessToken');
}
export function setToken(token: string) {
  sessionStorage.setItem('accessToken', token);
}
export function clearToken() {
  sessionStorage.removeItem('accessToken');
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as any),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      msg = data.message ?? msg;
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as any;
  return (await res.json()) as T;
}

export const api = {
  auth: {
    register: (body: { email: string; password: string; name?: string; groupName?: string }) =>
      request<{ accessToken: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      request<{ accessToken: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request<any>('/auth/me'),
  },
  patients: {
    list: () => request<any[]>('/patients'),
    create: (body: { displayName: string; timezone?: string }) =>
      request<any>('/patients', { method: 'POST', body: JSON.stringify(body) }),
    get: (id: string) => request<any>(`/patients/${id}`),
    addContact: (id: string, email: string) =>
      request<any>(`/patients/${id}/contacts`, { method: 'POST', body: JSON.stringify({ email }) }),
    removeContact: (id: string, contactId: string) =>
      request<any>(`/patients/${id}/contacts/${contactId}`, { method: 'DELETE' }),
    update: (id: string, body: any) => request<any>(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
  dashboard: {
    get: (patientId: string) => request<any>(`/patients/${patientId}/dashboard`),
  },
  meds: {
    create: (body: any) => request<any>('/medications', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/medications/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    take: (id: string) => request<any>(`/medications/${id}/take`, { method: 'POST', body: JSON.stringify({}) }),
    addStock: (id: string, qty: number, note?: string) =>
      request<any>(`/medications/${id}/stock/add`, { method: 'POST', body: JSON.stringify({ qty, note }) }),
    snooze: (id: string, minutes: number) =>
      request<any>(`/medications/${id}/snooze`, { method: 'POST', body: JSON.stringify({ minutes }) }),
    undo: (doseLogId: string) => request<any>(`/dose-logs/${doseLogId}/undo`, { method: 'POST', body: JSON.stringify({}) }),
  },
};
