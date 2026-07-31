import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/error.middleware';
import { successResponse, paginatedResponse } from '../responses/apiResponse';
import { getPagination } from '../utils/helpers';
import { doctorService } from '../services/doctor.service';
import { patientService } from '../services/patient.service';
import { appointmentService } from '../services/appointment.service';
import { prescriptionService } from '../services/prescription.service';
import { billService } from '../services/bill.service';
import {
  departmentService,
  staffService,
  reviewService,
  dashboardService,
} from '../services/common.service';
import { notificationService } from '../services/notification.service';
import { auditService } from '../services/audit.service';
import {
  createAppointmentSchema,
  createBillSchema,
  createDepartmentSchema,
  createDoctorSchema,
  createPatientSchema,
  createPrescriptionSchema,
  createReviewSchema,
  createStaffSchema,
  payBillSchema,
  updateAppointmentSchema,
  updateDoctorSchema,
  updatePatientSchema,
  updateScheduleSchema,
} from '../validators/schemas';

// ─── Doctors ─────────────────────────────────────────────────────────────────

export const listDoctors = asyncHandler(async (req: AuthRequest, res: Response) => {
  const p = getPagination(req);
  const result = await doctorService.list({
    ...p,
    departmentId: req.query.departmentId as string | undefined,
  });
  return paginatedResponse(res, result.items, { page: p.page, limit: p.limit, total: result.total });
});

export const getDoctor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const doctor = await doctorService.getById(req.params.id);
  return successResponse(res, doctor);
});

export const createDoctor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = createDoctorSchema.parse(req.body);
  const doctor = await doctorService.create(body, req.user!.id);
  return successResponse(res, doctor, 'Doctor created', 201);
});

export const updateDoctor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = updateDoctorSchema.parse(req.body);
  const doctor = await doctorService.update(req.params.id, body, req.user!.id);
  return successResponse(res, doctor, 'Doctor updated');
});

export const deleteDoctor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await doctorService.remove(req.params.id, req.user!.id);
  return successResponse(res, result);
});

export const updateDoctorSchedule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = updateScheduleSchema.parse(req.body);
  const doctorId = req.user!.role === 'DOCTOR' ? req.user!.doctorId! : req.params.id;
  const schedules = await doctorService.updateSchedule(doctorId, body.schedules);
  return successResponse(res, schedules, 'Schedule updated');
});

export const getDoctorSlots = asyncHandler(async (req: AuthRequest, res: Response) => {
  const date = req.query.date as string;
  const slots = await doctorService.getAvailableSlots(req.params.id, date);
  return successResponse(res, slots);
});

// ─── Patients ────────────────────────────────────────────────────────────────

export const listPatients = asyncHandler(async (req: AuthRequest, res: Response) => {
  const p = getPagination(req);
  const result = await patientService.list(p);
  return paginatedResponse(res, result.items, { page: p.page, limit: p.limit, total: result.total });
});

export const getPatient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.user!.role === 'PATIENT' ? req.user!.patientId! : req.params.id;
  const patient = await patientService.getById(id);
  return successResponse(res, patient);
});

export const createPatient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = createPatientSchema.parse(req.body);
  const patient = await patientService.create(body, req.user!.id);
  return successResponse(res, patient, 'Patient created', 201);
});

export const updatePatient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = updatePatientSchema.parse(req.body);
  const id = req.user!.role === 'PATIENT' ? req.user!.patientId! : req.params.id;
  const patient = await patientService.update(id, body, req.user!.id);
  return successResponse(res, patient, 'Patient updated');
});

export const deletePatient = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await patientService.remove(req.params.id, req.user!.id);
  return successResponse(res, result);
});

// ─── Appointments ────────────────────────────────────────────────────────────

export const listAppointments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const p = getPagination(req);
  const result = await appointmentService.list(
    {
      ...p,
      status: req.query.status as never,
      doctorId: req.query.doctorId as string | undefined,
      patientId: req.query.patientId as string | undefined,
      date: req.query.date as string | undefined,
    },
    req.user!
  );
  return paginatedResponse(res, result.items, { page: p.page, limit: p.limit, total: result.total });
});

export const getAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const appointment = await appointmentService.getById(req.params.id, req.user!);
  return successResponse(res, appointment);
});

export const createAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = createAppointmentSchema.parse(req.body);
  const appointment = await appointmentService.create(body, req.user!);
  return successResponse(res, appointment, 'Appointment booked', 201);
});

export const updateAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = updateAppointmentSchema.parse(req.body);
  const appointment = await appointmentService.update(req.params.id, body, req.user!);
  return successResponse(res, appointment, 'Appointment updated');
});

export const deleteAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await appointmentService.remove(req.params.id, req.user!);
  return successResponse(res, result);
});

export const todayQueue = asyncHandler(async (req: AuthRequest, res: Response) => {
  const queue = await appointmentService.todayQueue(req.query.doctorId as string | undefined, req.user!);
  return successResponse(res, queue);
});

// ─── Prescriptions ───────────────────────────────────────────────────────────

export const createPrescription = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = createPrescriptionSchema.parse(req.body);
  const prescription = await prescriptionService.create(body, req.user!);
  return successResponse(res, prescription, 'Prescription created', 201);
});

export const getPrescription = asyncHandler(async (req: AuthRequest, res: Response) => {
  const prescription = await prescriptionService.getById(req.params.id, req.user!);
  return successResponse(res, prescription);
});

export const updatePrescription = asyncHandler(async (req: AuthRequest, res: Response) => {
  const prescription = await prescriptionService.update(req.params.id, req.body, req.user!);
  return successResponse(res, prescription, 'Prescription updated');
});

export const listPatientPrescriptions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const patientId = req.user!.role === 'PATIENT' ? req.user!.patientId! : (req.query.patientId as string);
  const items = await prescriptionService.listForPatient(patientId);
  return successResponse(res, items);
});

// ─── Bills ───────────────────────────────────────────────────────────────────

export const listBills = asyncHandler(async (req: AuthRequest, res: Response) => {
  const p = getPagination(req);
  const result = await billService.list(
    { ...p, paymentStatus: req.query.paymentStatus as string | undefined },
    req.user!
  );
  return paginatedResponse(res, result.items, { page: p.page, limit: p.limit, total: result.total });
});

export const getBill = asyncHandler(async (req: AuthRequest, res: Response) => {
  const bill = await billService.getById(req.params.id);
  return successResponse(res, bill);
});

export const createBill = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = createBillSchema.parse(req.body);
  const bill = await billService.create(body, req.user!);
  return successResponse(res, bill, 'Bill created', 201);
});

export const payBill = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = payBillSchema.parse(req.body);
  const bill = await billService.pay(req.params.id, body, req.user!);
  return successResponse(res, bill, 'Payment recorded');
});

// ─── Departments / Staff / Reviews / Notifications / Dashboard ───────────────

export const listDepartments = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const items = await departmentService.list();
  return successResponse(res, items);
});

export const createDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = createDepartmentSchema.parse(req.body);
  const dept = await departmentService.create(body);
  return successResponse(res, dept, 'Department created', 201);
});

export const updateDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const dept = await departmentService.update(req.params.id, req.body);
  return successResponse(res, dept, 'Department updated');
});

export const deleteDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await departmentService.remove(req.params.id);
  return successResponse(res, result);
});

export const listStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const p = getPagination(req);
  const result = await staffService.list(p);
  return paginatedResponse(res, result.items, { page: p.page, limit: p.limit, total: result.total });
});

export const createStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = createStaffSchema.parse(req.body);
  const staff = await staffService.create(body);
  return successResponse(res, staff, 'Staff created', 201);
});

export const deleteStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await staffService.remove(req.params.id);
  return successResponse(res, result);
});

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = createReviewSchema.parse(req.body);
  const review = await reviewService.create(body, req.user!);
  return successResponse(res, review, 'Review submitted', 201);
});

export const listDoctorReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reviews = await reviewService.listForDoctor(req.params.id);
  return successResponse(res, reviews);
});

export const listNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const p = getPagination(req);
  const result = await notificationService.listForUser(req.user!.id, p.page, p.limit);
  return successResponse(res, result);
});

export const markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await notificationService.markRead(req.params.id, req.user!.id);
  return successResponse(res, { message: 'Marked as read' });
});

export const markAllNotificationsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await notificationService.markAllRead(req.user!.id);
  return successResponse(res, { message: 'All marked as read' });
});

export const getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const role = req.user!.role;
  if (role === 'DOCTOR') {
    return successResponse(res, await dashboardService.doctorStats(req.user!.doctorId!));
  }
  if (role === 'PATIENT') {
    return successResponse(res, await dashboardService.patientStats(req.user!.patientId!));
  }
  if (role === 'STAFF') {
    return successResponse(res, await dashboardService.staffStats());
  }
  return successResponse(res, await dashboardService.adminStats());
});

export const listAuditLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const p = getPagination(req);
  const result = await auditService.list(p.page, p.limit);
  return paginatedResponse(res, result.items, { page: p.page, limit: p.limit, total: result.total });
});
