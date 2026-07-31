export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'DoctorCare';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
export const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT || 30000);

export const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: '/admin',
  ADMIN: '/admin',
  DOCTOR: '/doctor',
  PATIENT: '/patient',
  STAFF: '/staff',
};
