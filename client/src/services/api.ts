const API_BASE = '/api';

export function getToken(): string | null {
  return localStorage.getItem('earnloop_token');
}

export function setToken(token: string): void {
  localStorage.setItem('earnloop_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('earnloop_token');
}

export function getAdminPin(): string | null {
  return localStorage.getItem('earnloop_admin_pin');
}

export function setAdminPin(pin: string): void {
  localStorage.setItem('earnloop_admin_pin', pin);
}

export function clearAdminPin(): void {
  localStorage.removeItem('earnloop_admin_pin');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const adminPin = getAdminPin();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (adminPin) {
    headers['x-admin-pin'] = adminPin;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}: Failed request`);
  }

  return data as T;
}

export const api = {
  // Auth
  sendOtp: (phone: string, purpose = 'REGISTRATION') =>
    request<{ success: boolean; message: string; mockOtp?: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, purpose }),
    }),
  register: (body: { phone: string; password: string; otpCode: string; referralCode?: string }) =>
    request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { phone: string; password?: string; otpLogin?: boolean; otpCode?: string }) =>
    request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body: { phone: string; otpCode: string; newPassword: string }) =>
    request<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<any>('/auth/me'),
  updateProfile: (body: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Wallet
  getWallet: () => request<{ wallet: any }>('/wallet'),
  getTransactions: () => request<{ transactions: any[] }>('/wallet/transactions'),
  getDepositChannels: () => request<any>('/wallet/deposit-channels'),

  // Orders
  getPackages: () => request<any>('/orders/packages'),
  createBuyOrder: (body: { type: 'INR_BUY' | 'USDT_BUY'; fiatAmount: string; network?: string; tier?: string }) =>
    request<any>('/orders/buy', { method: 'POST', body: JSON.stringify(body) }),
  submitProof: (body: { orderId: string; utrNumber: string; proofImage?: string }) =>
    request<any>('/orders/submit-proof', { method: 'POST', body: JSON.stringify(body) }),
  createWithdrawal: (body: { mcoinAmount: string; destinationType: string; destinationValue: string }) =>
    request<any>('/orders/withdraw', { method: 'POST', body: JSON.stringify(body) }),
  getMyOrders: () => request<{ orders: any[] }>('/orders/my-orders'),

  // Tasks
  getTasks: () => request<{ tasks: any[] }>('/tasks'),
  submitTask: (body: { taskId: string; proofText?: string; proofImage?: string }) =>
    request<any>('/tasks/submit', { method: 'POST', body: JSON.stringify(body) }),
  getMySubmissions: () => request<{ submissions: any[] }>('/tasks/my-submissions'),

  // Team
  getTeamData: () => request<any>('/team'),

  // Admin
  adminLogin: (pin: string) =>
    request<any>('/admin/login', { method: 'POST', body: JSON.stringify({ pin }) }),
  getAdminStats: () => request<any>('/admin/stats'),
  getAdminUsers: () => request<any>('/admin/users'),
  adjustUserBalance: (body: { userId: string; amount: string; action: 'CREDIT' | 'DEBIT'; reason: string }) =>
    request<any>('/admin/users/adjust-balance', { method: 'POST', body: JSON.stringify(body) }),
  getAdminOrders: () => request<any>('/admin/orders'),
  reviewOrder: (body: { orderId: string; decision: 'APPROVE' | 'REJECT'; adminNote?: string }) =>
    request<any>('/admin/orders/review', { method: 'POST', body: JSON.stringify(body) }),
  getAdminTaskSubmissions: () => request<any>('/admin/tasks/submissions'),
  reviewTaskSubmission: (body: { submissionId: string; decision: 'APPROVE' | 'REJECT'; adminFeedback?: string }) =>
    request<any>('/admin/tasks/review', { method: 'POST', body: JSON.stringify(body) }),
  getAdminSettings: () => request<any>('/admin/settings'),
  updateAdminSettings: (settings: any) =>
    request<any>('/admin/settings', { method: 'PUT', body: JSON.stringify({ settings }) }),
  getAdminAuditLogs: () => request<any>('/admin/audit-logs'),
};
