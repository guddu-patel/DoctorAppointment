import { Router } from 'express';
import * as auth from '../controllers/auth.controller';
import * as mod from '../controllers/modules.controller';
import { authenticate, authorize, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

// ─── Auth ────────────────────────────────────────────────────────────────────
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.post('/auth/refresh', auth.refresh);
router.post('/auth/logout', auth.logout);
router.post('/auth/forgot-password', auth.forgotPassword);
router.get('/auth/me', authenticate, auth.me);

// ─── Departments (public list) ───────────────────────────────────────────────
router.get('/departments', mod.listDepartments);
router.post('/departments', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), mod.createDepartment);
router.put('/departments/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), mod.updateDepartment);
router.delete('/departments/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), mod.deleteDepartment);

// ─── Doctors ─────────────────────────────────────────────────────────────────
router.get('/doctors', optionalAuth, mod.listDoctors);
router.get('/doctors/:id', optionalAuth, mod.getDoctor);
router.get('/doctors/:id/slots', mod.getDoctorSlots);
router.get('/doctors/:id/reviews', mod.listDoctorReviews);
router.post('/doctors', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), mod.createDoctor);
router.put('/doctors/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'DOCTOR'), mod.updateDoctor);
router.delete('/doctors/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), mod.deleteDoctor);
router.put('/doctors/:id/schedule', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'DOCTOR'), mod.updateDoctorSchedule);

// ─── Patients ────────────────────────────────────────────────────────────────
router.get('/patients', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'STAFF', 'DOCTOR'), mod.listPatients);
router.get('/patients/:id', authenticate, mod.getPatient);
router.post('/patients', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'STAFF'), mod.createPatient);
router.put('/patients/:id', authenticate, mod.updatePatient);
router.delete('/patients/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), mod.deletePatient);

// ─── Appointments ────────────────────────────────────────────────────────────
router.get('/appointments', authenticate, mod.listAppointments);
router.get('/appointments/queue/today', authenticate, mod.todayQueue);
router.get('/appointments/:id', authenticate, mod.getAppointment);
router.post('/appointments', authenticate, mod.createAppointment);
router.put('/appointments/:id', authenticate, mod.updateAppointment);
router.delete('/appointments/:id', authenticate, mod.deleteAppointment);

// ─── Prescriptions ───────────────────────────────────────────────────────────
router.get('/prescriptions', authenticate, mod.listPatientPrescriptions);
router.get('/prescriptions/:id', authenticate, mod.getPrescription);
router.post('/prescriptions', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'DOCTOR'), mod.createPrescription);
router.put('/prescriptions/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'DOCTOR'), mod.updatePrescription);

// ─── Billing ─────────────────────────────────────────────────────────────────
router.get('/bills', authenticate, mod.listBills);
router.get('/bills/:id', authenticate, mod.getBill);
router.post('/bills', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'STAFF'), mod.createBill);
router.post('/bills/:id/pay', authenticate, mod.payBill);

// ─── Staff ───────────────────────────────────────────────────────────────────
router.get('/staff', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), mod.listStaff);
router.post('/staff', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), mod.createStaff);
router.delete('/staff/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), mod.deleteStaff);

// ─── Reviews ─────────────────────────────────────────────────────────────────
router.post('/reviews', authenticate, authorize('PATIENT'), mod.createReview);

// ─── Notifications ───────────────────────────────────────────────────────────
router.get('/notifications', authenticate, mod.listNotifications);
router.patch('/notifications/:id/read', authenticate, mod.markNotificationRead);
router.patch('/notifications/read-all', authenticate, mod.markAllNotificationsRead);

// ─── Dashboard & Audit ───────────────────────────────────────────────────────
router.get('/dashboard', authenticate, mod.getDashboard);
router.get('/audit-logs', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), mod.listAuditLogs);

// Health
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'OK', timestamp: new Date().toISOString() });
});

export default router;
