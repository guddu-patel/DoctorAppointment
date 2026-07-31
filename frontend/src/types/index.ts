export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  status: string;
  emailVerified?: boolean;
  avatarUrl?: string | null;
  doctorId?: string | null;
  patientId?: string | null;
  staffId?: string | null;
  profile?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  _count?: { doctors: number };
}

export interface Doctor {
  id: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  licenseNumber: string;
  bio?: string | null;
  photo?: string | null;
  isAvailable: boolean;
  averageRating?: number;
  reviewCount?: number;
  department: Department;
  user: { id: string; name: string; email: string; phone?: string | null; avatarUrl?: string | null };
  schedules?: {
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    slotMins: number;
  }[];
}

export interface Patient {
  id: string;
  bloodGroup?: string;
  dob?: string | null;
  gender?: string | null;
  address?: string | null;
  allergies?: string | null;
  medicalHistory?: string | null;
  insuranceProvider?: string | null;
  insuranceNumber?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  user: { id: string; name: string; email: string; phone?: string | null };
}

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'NO_SHOW';

export interface Appointment {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reason?: string | null;
  notes?: string | null;
  queueNumber?: number | null;
  doctor: Doctor;
  patient: Patient;
  prescription?: Prescription | null;
  bill?: Bill | null;
}

export interface Prescription {
  id: string;
  diagnosis: string;
  medicines: { name: string; dosage: string; frequency: string; duration: string; notes?: string }[];
  tests?: string[] | null;
  notes?: string | null;
  followupDate?: string | null;
  createdAt: string;
  doctor?: { user: { name: string }; department?: Department };
  appointment?: Appointment;
}

export interface Bill {
  id: string;
  billNumber: string;
  consultationFee: number;
  medicineCharges: number;
  labCharges: number;
  otherCharges: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  paymentStatus: string;
  paymentMethod?: string | null;
  appointment?: Appointment;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}
