import { Request } from 'express';

export function getPagination(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
  const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, skip, search, sortBy, sortOrder };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateBillNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${y}${m}${d}-${rand}`;
}

/** Map JS getDay() (0=Sun) to DayOfWeek enum */
export function jsDayToEnum(day: number): string {
  const map = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return map[day];
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function generateSlots(startTime: string, endTime: string, slotMins: number): string[] {
  const slots: string[] = [];
  let current = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  while (current + slotMins <= end) {
    slots.push(minutesToTime(current));
    current += slotMins;
  }
  return slots;
}
