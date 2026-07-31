import { api } from '@/lib/api';
import type {
  ApiResponse,
  Appointment,
  AuthResult,
  Bill,
  Department,
  Doctor,
  NotificationItem,
  Patient,
  Prescription,
  User,
} from '@/types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResult>>('/auth/login', { email, password }),
  register: (payload: { name: string; email: string; password: string; phone?: string }) =>
    api.post<ApiResponse<AuthResult>>('/auth/register', payload),
  me: () => api.get<ApiResponse<User>>('/auth/me'),
  logout: (refreshToken?: string) => api.post('/auth/logout', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
};

export const doctorsApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<Doctor[]>>('/doctors', { params }),
  get: (id: string) => api.get<ApiResponse<Doctor>>(`/doctors/${id}`),
  slots: (id: string, date: string) =>
    api.get<ApiResponse<{ date: string; slots: { startTime: string; endTime: string }[]; reason?: string }>>(
      `/doctors/${id}/slots`,
      { params: { date } }
    ),
  create: (data: unknown) => api.post('/doctors', data),
  update: (id: string, data: unknown) => api.put(`/doctors/${id}`, data),
  remove: (id: string) => api.delete(`/doctors/${id}`),
  updateSchedule: (id: string, schedules: unknown) =>
    api.put(`/doctors/${id}/schedule`, { schedules }),
};

export const patientsApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<Patient[]>>('/patients', { params }),
  get: (id: string) => api.get<ApiResponse<Patient>>(`/patients/${id}`),
  create: (data: unknown) => api.post('/patients', data),
  update: (id: string, data: unknown) => api.put(`/patients/${id}`, data),
};

export const appointmentsApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<Appointment[]>>('/appointments', { params }),
  get: (id: string) => api.get<ApiResponse<Appointment>>(`/appointments/${id}`),
  create: (data: unknown) => api.post<ApiResponse<Appointment>>('/appointments', data),
  update: (id: string, data: unknown) => api.put(`/appointments/${id}`, data),
  remove: (id: string) => api.delete(`/appointments/${id}`),
  todayQueue: (doctorId?: string) =>
    api.get<ApiResponse<Appointment[]>>('/appointments/queue/today', {
      params: doctorId ? { doctorId } : undefined,
    }),
};

export const prescriptionsApi = {
  list: (patientId?: string) =>
    api.get<ApiResponse<Prescription[]>>('/prescriptions', {
      params: patientId ? { patientId } : undefined,
    }),
  get: (id: string) => api.get<ApiResponse<Prescription>>(`/prescriptions/${id}`),
  create: (data: unknown) => api.post('/prescriptions', data),
};

export const billsApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get<ApiResponse<Bill[]>>('/bills', { params }),
  get: (id: string) => api.get<ApiResponse<Bill>>(`/bills/${id}`),
  create: (data: unknown) => api.post('/bills', data),
  pay: (id: string, data: { paymentMethod: string }) => api.post(`/bills/${id}/pay`, data),
};

export const departmentsApi = {
  list: () => api.get<ApiResponse<Department[]>>('/departments'),
  create: (data: unknown) => api.post('/departments', data),
};

export const notificationsApi = {
  list: () => api.get<ApiResponse<{ items: NotificationItem[]; unreadCount: number }>>('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const dashboardApi = {
  get: () => api.get<ApiResponse<Record<string, unknown>>>('/dashboard'),
};

export const staffApi = {
  list: (params?: Record<string, string | number | undefined>) => api.get('/staff', { params }),
  create: (data: unknown) => api.post('/staff', data),
};

export const reviewsApi = {
  create: (data: { doctorId: string; rating: number; review?: string }) =>
    api.post('/reviews', data),
};
