process.env.NODE_ENV = 'test';
process.env.APP_NAME = 'Doctor Appointment API Test';
process.env.APP_URL = 'http://localhost:4000';
process.env.API_VERSION = 'v1';
process.env.PORT = '4000';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:12345@localhost:5432/doctor_appointment?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-at-least-32-chars!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-at-least-32-chars!';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '1000';
process.env.UPLOAD_DIR = './uploads';
process.env.UPLOAD_MAX_SIZE_MB = '10';
process.env.LOG_LEVEL = 'error';
