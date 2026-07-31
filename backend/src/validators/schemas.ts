import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().min(7).max(20).optional(),
  role: z.enum(['PATIENT', 'DOCTOR', 'STAFF']).default('PATIENT'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const createDoctorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  departmentId: z.string().min(1),
  qualification: z.string().min(2),
  experience: z.number().int().min(0).default(0),
  consultationFee: z.number().min(0),
  licenseNumber: z.string().min(3),
  bio: z.string().optional(),
  schedules: z
    .array(
      z.object({
        dayOfWeek: z.enum([
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
          'SATURDAY',
          'SUNDAY',
        ]),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        slotMins: z.number().int().min(10).max(120).default(30),
      })
    )
    .optional(),
});

export const updateDoctorSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  departmentId: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  consultationFee: z.number().min(0).optional(),
  bio: z.string().optional(),
  isAvailable: z.boolean().optional(),
  photo: z.string().optional(),
});

export const updateScheduleSchema = z.object({
  schedules: z.array(
    z.object({
      dayOfWeek: z.enum([
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY',
      ]),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      slotMins: z.number().int().min(10).max(120).default(30),
      isActive: z.boolean().default(true),
    })
  ),
});

export const createPatientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  phone: z.string().optional(),
  bloodGroup: z
    .enum([
      'A_POSITIVE',
      'A_NEGATIVE',
      'B_POSITIVE',
      'B_NEGATIVE',
      'AB_POSITIVE',
      'AB_NEGATIVE',
      'O_POSITIVE',
      'O_NEGATIVE',
      'UNKNOWN',
    ])
    .optional(),
  dob: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
});

export const updatePatientSchema = createPatientSchema.partial().omit({ email: true, password: true });

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1),
  patientId: z.string().optional(),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  status: z
    .enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'])
    .optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  cancelledReason: z.string().optional(),
});

export const createPrescriptionSchema = z.object({
  appointmentId: z.string().min(1),
  diagnosis: z.string().min(2),
  medicines: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      duration: z.string(),
      notes: z.string().optional(),
    })
  ),
  tests: z.array(z.string()).optional(),
  notes: z.string().optional(),
  followupDate: z.string().optional(),
});

export const createBillSchema = z.object({
  appointmentId: z.string().min(1),
  consultationFee: z.number().min(0).default(0),
  medicineCharges: z.number().min(0).default(0),
  labCharges: z.number().min(0).default(0),
  otherCharges: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'ONLINE', 'INSURANCE']).optional(),
  notes: z.string().optional(),
});

export const payBillSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'ONLINE', 'INSURANCE']),
  paymentStatus: z.enum(['PAID', 'PARTIAL', 'PENDING']).default('PAID'),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const createReviewSchema = z.object({
  doctorId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  review: z.string().optional(),
});

export const createStaffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  designation: z.string().optional(),
});
