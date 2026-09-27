const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('sahihisaab_token') || 'user_demo_rahul_123';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const api = {
  // Auth
  sendOtp: async (phone) => {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return res.json();
  },

  verifyOtp: async (phone, otp) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    return res.json();
  },

  // User Profile
  getProfile: async () => {
    const res = await fetch(`${API_BASE}/user/profile`, {
      headers: getHeaders()
    });
    return res.json();
  },

  updateProfile: async (data) => {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Income
  getIncome: async () => {
    const res = await fetch(`${API_BASE}/income`, {
      headers: getHeaders()
    });
    return res.json();
  },

  addIncome: async (entry) => {
    const res = await fetch(`${API_BASE}/income`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(entry)
    });
    return res.json();
  },

  deleteIncome: async (id) => {
    const res = await fetch(`${API_BASE}/income/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Expenses
  getExpenses: async () => {
    const res = await fetch(`${API_BASE}/expenses`, {
      headers: getHeaders()
    });
    return res.json();
  },

  addExpense: async (entry) => {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(entry)
    });
    return res.json();
  },

  deleteExpense: async (id) => {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // OCR Screenshot Parse
  parseOcr: async (file) => {
    const formData = new FormData();
    if (file) formData.append('file', file);

    const token = localStorage.getItem('sahihisaab_token') || 'user_demo_rahul_123';
    const res = await fetch(`${API_BASE}/ocr/parse`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return res.json();
  },

  // Dashboard Stats
  getDashboardStats: async (timeframe = 'this_month') => {
    const res = await fetch(`${API_BASE}/dashboard/stats?timeframe=${timeframe}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Schemes Eligibility
  checkSchemes: async (data = {}) => {
    const res = await fetch(`${API_BASE}/schemes/check`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  toggleEnrollScheme: async (schemeCode, enrolledState) => {
    const res = await fetch(`${API_BASE}/schemes/toggle-enroll`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ scheme_code: schemeCode, enrolled: enrolledState })
    });
    return res.json();
  },

  // Credit Readiness Score
  getCreditScore: async () => {
    const res = await fetch(`${API_BASE}/credit-score`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Reset Demo DB
  resetDemoData: async () => {
    const res = await fetch(`${API_BASE}/demo/reset`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  }
};
