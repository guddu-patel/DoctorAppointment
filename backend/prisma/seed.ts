import { PrismaClient, DayOfWeek } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Doctor Appointment database...\n');

  // Clean existing (dev only)
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorHoliday.deleteMany();
  await prisma.doctorSchedule.deleteMany();
  await prisma.patientDocument.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.tokenBlacklist.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.systemSetting.deleteMany();

  const password = await bcrypt.hash('Password@123', 12);

  const departments = await Promise.all(
    [
      { name: 'General Medicine', slug: 'general-medicine', description: 'Primary care and general health', icon: 'stethoscope' },
      { name: 'Cardiology', slug: 'cardiology', description: 'Heart and cardiovascular care', icon: 'heart' },
      { name: 'Dermatology', slug: 'dermatology', description: 'Skin, hair and nail specialists', icon: 'sparkles' },
      { name: 'Orthopedics', slug: 'orthopedics', description: 'Bones, joints and sports medicine', icon: 'bone' },
      { name: 'Pediatrics', slug: 'pediatrics', description: 'Child and adolescent healthcare', icon: 'baby' },
      { name: 'Neurology', slug: 'neurology', description: 'Brain and nervous system care', icon: 'brain' },
    ].map((d) => prisma.department.create({ data: d }))
  );

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@doctorcare.local',
      password,
      role: 'SUPER_ADMIN',
      phone: '+91-9000000001',
      emailVerified: true,
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      name: 'Riya Sharma',
      email: 'staff@doctorcare.local',
      password,
      role: 'STAFF',
      phone: '+91-9000000002',
      emailVerified: true,
      staff: { create: { designation: 'Receptionist' } },
    },
    include: { staff: true },
  });

  const weekdays: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const scheduleData = weekdays.map((dayOfWeek) => ({
    dayOfWeek,
    startTime: '09:00',
    endTime: '17:00',
    slotMins: 30,
  }));

  const doctor1 = await prisma.doctor.create({
    data: {
      qualification: 'MBBS, MD (Medicine)',
      experience: 12,
      consultationFee: 800,
      licenseNumber: 'MED-IND-1001',
      bio: 'Experienced physician specializing in chronic disease management and preventive care.',
      department: { connect: { id: departments[0].id } },
      user: {
        create: {
          name: 'Dr. Ananya Mehta',
          email: 'doctor@doctorcare.local',
          password,
          role: 'DOCTOR',
          phone: '+91-9000000003',
          emailVerified: true,
        },
      },
      schedules: { create: scheduleData },
    },
    include: { user: true },
  });

  const doctor2 = await prisma.doctor.create({
    data: {
      qualification: 'MBBS, DM (Cardiology)',
      experience: 15,
      consultationFee: 1500,
      licenseNumber: 'MED-IND-1002',
      bio: 'Interventional cardiologist with expertise in ECG, Echo and lifestyle heart care.',
      department: { connect: { id: departments[1].id } },
      user: {
        create: {
          name: 'Dr. Vikram Singh',
          email: 'cardio@doctorcare.local',
          password,
          role: 'DOCTOR',
          phone: '+91-9000000004',
          emailVerified: true,
        },
      },
      schedules: { create: scheduleData },
    },
    include: { user: true },
  });

  const doctor3 = await prisma.doctor.create({
    data: {
      qualification: 'MBBS, MD (Dermatology)',
      experience: 8,
      consultationFee: 900,
      licenseNumber: 'MED-IND-1003',
      bio: 'Dermatologist focused on acne, pigmentation and clinical skin treatments.',
      department: { connect: { id: departments[2].id } },
      user: {
        create: {
          name: 'Dr. Neha Kapoor',
          email: 'derm@doctorcare.local',
          password,
          role: 'DOCTOR',
          phone: '+91-9000000005',
          emailVerified: true,
        },
      },
      schedules: {
        create: [
          ...scheduleData,
          { dayOfWeek: 'SATURDAY' as DayOfWeek, startTime: '10:00', endTime: '14:00', slotMins: 30 },
        ],
      },
    },
    include: { user: true },
  });

  const patient1 = await prisma.patient.create({
    data: {
      bloodGroup: 'O_POSITIVE',
      dob: new Date('1995-06-15'),
      gender: 'MALE',
      address: '12 Green Park, New Delhi',
      emergencyContact: 'Suresh Kumar',
      emergencyPhone: '+91-9888888888',
      allergies: 'Penicillin',
      medicalHistory: 'Mild asthma',
      insuranceProvider: 'Star Health',
      insuranceNumber: 'SH-998877',
      user: {
        create: {
          name: 'Aarav Patel',
          email: 'patient@doctorcare.local',
          password,
          role: 'PATIENT',
          phone: '+91-9000000006',
          emailVerified: true,
        },
      },
    },
    include: { user: true },
  });

  const patient2 = await prisma.patient.create({
    data: {
      bloodGroup: 'B_POSITIVE',
      dob: new Date('1988-03-22'),
      gender: 'FEMALE',
      address: '45 MG Road, Bengaluru',
      allergies: 'None',
      user: {
        create: {
          name: 'Priya Nair',
          email: 'patient2@doctorcare.local',
          password,
          role: 'PATIENT',
          phone: '+91-9000000007',
          emailVerified: true,
        },
      },
    },
    include: { user: true },
  });

  // Create appointments for upcoming weekdays
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
    tomorrow.setDate(tomorrow.getDate() + 1);
  }
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);
  while (dayAfter.getDay() === 0 || dayAfter.getDay() === 6) {
    dayAfter.setDate(dayAfter.getDate() + 1);
  }

  const appt1 = await prisma.appointment.create({
    data: {
      doctorId: doctor1.id,
      patientId: patient1.id,
      appointmentDate: tomorrow,
      startTime: '10:00',
      endTime: '10:30',
      status: 'CONFIRMED',
      reason: 'Routine checkup',
      queueNumber: 1,
    },
  });

  await prisma.appointment.create({
    data: {
      doctorId: doctor2.id,
      patientId: patient1.id,
      appointmentDate: dayAfter,
      startTime: '11:00',
      endTime: '11:30',
      status: 'PENDING',
      reason: 'Chest discomfort',
      queueNumber: 1,
    },
  });

  await prisma.appointment.create({
    data: {
      doctorId: doctor1.id,
      patientId: patient2.id,
      appointmentDate: tomorrow,
      startTime: '10:30',
      endTime: '11:00',
      status: 'CONFIRMED',
      reason: 'Follow-up',
      queueNumber: 2,
    },
  });

  const past = new Date();
  past.setDate(past.getDate() - 7);
  past.setHours(0, 0, 0, 0);

  const pastAppt = await prisma.appointment.create({
    data: {
      doctorId: doctor3.id,
      patientId: patient1.id,
      appointmentDate: past,
      startTime: '11:00',
      endTime: '11:30',
      status: 'COMPLETED',
      reason: 'Skin rash',
      queueNumber: 1,
    },
  });

  await prisma.prescription.create({
    data: {
      appointmentId: pastAppt.id,
      doctorId: doctor3.id,
      patientId: patient1.id,
      diagnosis: 'Contact dermatitis',
      medicines: [
        { name: 'Hydrocortisone cream', dosage: '1%', frequency: 'Twice daily', duration: '7 days' },
        { name: 'Cetirizine', dosage: '10mg', frequency: 'Once at night', duration: '5 days' },
      ],
      tests: [],
      notes: 'Avoid known allergens. Moisturize regularly.',
      followupDate: tomorrow,
    },
  });

  await prisma.bill.create({
    data: {
      appointmentId: pastAppt.id,
      billNumber: 'INV-SEED-0001',
      consultationFee: 900,
      medicineCharges: 250,
      labCharges: 0,
      otherCharges: 0,
      discount: 50,
      tax: 108,
      subtotal: 1150,
      total: 1208,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      paidAt: past,
    },
  });

  await prisma.bill.create({
    data: {
      appointmentId: appt1.id,
      billNumber: 'INV-SEED-0002',
      consultationFee: 800,
      medicineCharges: 0,
      labCharges: 0,
      otherCharges: 0,
      discount: 0,
      tax: 0,
      subtotal: 800,
      total: 800,
      paymentStatus: 'PENDING',
    },
  });

  await prisma.review.create({
    data: {
      doctorId: doctor3.id,
      patientId: patient1.id,
      rating: 5,
      review: 'Very attentive and explained everything clearly.',
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: patient1.userId,
        title: 'Appointment Confirmed',
        message: `Your appointment with Dr. Ananya Mehta on ${tomorrow.toISOString().slice(0, 10)} at 10:00 is confirmed.`,
        type: 'APPOINTMENT_CONFIRMED',
      },
      {
        userId: doctor1.userId,
        title: 'New Appointment',
        message: 'Aarav Patel has a confirmed appointment tomorrow at 10:00.',
        type: 'APPOINTMENT_BOOKED',
      },
    ],
  });

  console.log('✅ Seed complete!\n');
  console.log('Demo accounts (password: Password@123):');
  console.log('  Admin:    admin@doctorcare.local');
  console.log('  Doctor:   doctor@doctorcare.local');
  console.log('  Staff:    staff@doctorcare.local');
  console.log('  Patient:  patient@doctorcare.local');
  console.log(`  Admin ID: ${admin.id}`);
  console.log(`  Staff:    ${staffUser.email}`);
  console.log(`  Doctors:  ${doctor1.user.email}, ${doctor2.user.email}, ${doctor3.user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
