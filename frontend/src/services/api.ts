const API_BASE_URL = "http://localhost:8080/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
export interface ForgotPasswordRequest {
  email: string;
}

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
}

export interface DonorRequest {
  name: string;
  amount: number;
  phone?: string;
  address?: string;
  paymentMode: string;
  donationDate: string;
  notes?: string;
}

export interface DonorResponse {
  id: number;
  name: string;
  amount: number;
  phone?: string;
  address?: string;
  paymentMode: string;
  donationDate: string;
  notes?: string;
  createdAt?: string;
  festivalId: number;
}
export interface ExpenseRequest {
    category: string;
    amount: number;
    description: string;
    expenseDate: string;
}

export interface ExpenseResponse {
    id: number;
    festivalId: number;
    category: string;
    amount: number;
    description: string;
    expenseDate: string;
    createdAt?: string;
    updatedAt?: string;
}
export interface FestivalResponse {
  id: number;
  name: string;
  year: number;
  location?: string;
  description?: string;
  createdAt?: string;
}

export interface FestivalRequest {
  name: string;
  year: number;
  location?: string;
  description?: string;
  status?: string;
}

export interface ReportResponse {
  festivalId: number;
  festivalName: string;
  festivalYear: number;
  festivalLocation?: string;
  totalDonors: number;
  totalIncome: number;
  totalExpenses: number;
  totalExpenseAmount: number;
  balance: number;
  donors: DonorResponse[];
  expenses: ExpenseResponse[];
}

export interface DashboardStatsResponse {
    netBalance: number;
    totalIncome: number;
    totalExpense: number;
    donors: number;
    expenseEntries: number;
    fundHealth: number;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
}

export async function login(request: LoginRequest): Promise<LoginResponse> {

  const response = await fetch(`${API_BASE_URL}/auth/login`,{
      method: "POST",
      headers: {"Content-Type": "application/json",},
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Login failed");
  }

  return response.json();
}

export async function register(data: {
    name: string;
    email: string;
    password: string;}) {

    const response = await fetch("http://localhost:8080/api/auth/register",{
      method: "POST",
      headers: {"Content-Type": "application/json",},
      body: JSON.stringify(data),
    });

    const responseText = await response.text();

    console.log("REGISTER STATUS:", response.status);
    console.log("REGISTER RESPONSE:", responseText);
    if (!response.ok) {
        let message = `Registration failed (${response.status})`;
        try {
          const errorData = JSON.parse(responseText);
            if (errorData.message) {
              message = errorData.message;
            }
        } catch {
          if (responseText) {
            message = responseText;}
          }
        throw new Error(message);
      }
    return JSON.parse(responseText);
  }

export async function getCurrentUser(token: string): Promise<CurrentUser> {

  const response = await fetch(`${API_BASE_URL}/users/me`,{
    method: "GET",
    headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json",},
    }
  );

  if (!response.ok) {
    throw new Error("Unable to fetch current user");
  }
  return response.json();
}

export const getMyFestivals = async (): Promise<FestivalResponse[]> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/festivals`,{
    method: "GET",
    headers: {"Content-Type": "application/json", ...(token ? {Authorization: `Bearer ${token}`,}: {}),},
  });
  
  if (!response.ok) {
    throw new Error("Failed to load festivals");
  }
  return response.json();
};

export const getFestival = async (festivalId: number): Promise<FestivalResponse> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/festivals/${festivalId}`,{
    method: "GET",
    headers: {"Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}`, } : {}),},
  });

  if (!response.ok) {
    throw new Error("Failed to load festival");
  }
  return response.json();
};

export const createFestival = async (request: FestivalRequest): Promise<FestivalResponse> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/festivals`,{
    method: "POST",
    headers: {"Content-Type": "application/json", ...(token ? {Authorization: `Bearer ${token}`, } : {}),},
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to create festival");
  }
  return response.json();
};

export const getMyDonors = async (festivalId: number): Promise<DonorResponse[]> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/festivals/${festivalId}/donors`,{
    method: "GET",
    headers: {"Content-Type": "application/json", ...(token ? {Authorization: `Bearer ${token}`, } : {}),},
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to load donors");
  }
  return response.json();
};

export const createDonor = async (festivalId: number, request: DonorRequest): Promise<DonorResponse> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/festivals/${festivalId}/donors`,{
    method: "POST",
    headers: {"Content-Type": "application/json", ...(token ? {Authorization: `Bearer ${token}`,} : {}),},
    body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to create donor");
  }
  return response.json();
};

export const getMyExpenses = async (festivalId: number): Promise<ExpenseResponse[]> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/festivals/${festivalId}/expenses`,{
    method: "GET",
    headers: {"Content-Type": "application/json", ...(token ? {Authorization: `Bearer ${token}`,} : {}),},
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to load expenses");
    }
    return response.json();
};

export const createExpense = async (festivalId: number, request: ExpenseRequest) : Promise<ExpenseResponse> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/festivals/${festivalId}/expenses`,{
    method: "POST",
    headers: {"Content-Type": "application/json", ...(token ? {Authorization: `Bearer ${token}`, }: {}),},
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to create expense");
  }
  return response.json();
};

export const getDashboardStats = async (festivalId: number): Promise<DashboardStatsResponse> => {
  const token =localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/festivals/${festivalId}/dashboard/stats`,{
    method: "GET",
    headers: {"Content-Type": "application/json", ...(token ? {Authorization: `Bearer ${token}`, } : {}),},
  });
  if (!response.ok) {
    const message = await response.text();
        throw new Error(message || "Failed to load dashboard statistics");
    }
  return response.json();
};

export const getFestivalReport = async (festivalId: number): Promise<ReportResponse> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/festivals/${festivalId}/reports`,{
    method: "GET",
    headers: {"Content-Type": "application/json", ...(token ? {Authorization: `Bearer ${token}`, } : {}),},});
    if (!response.ok) {
      const message = await response.text();
        throw new Error(message || "Failed to load festival report");
    }
    return response.json();
};

export const forgotPassword = async (request: ForgotPasswordRequest) : Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`,{
    method: "POST",
    headers: {"Content-Type": "application/json",},
    body: JSON.stringify(request),
  });

  const message = await response.text();
  if (!response.ok) {
    throw new Error(message || "Failed to send password reset request");
  }
  return message;
};

export const resetPassword = async (request: ResetPasswordRequest) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`,{
    method: "POST",
    headers: {"Content-Type": "application/json",},
    body: JSON.stringify(request),
  });

  const responseText = await response.text();
    if (!response.ok) {
        throw new Error(responseText || "Password reset failed");
    }
    return responseText;
};