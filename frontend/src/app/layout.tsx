import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/auth-context';
import './globals.css';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

const body = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'DoctorCare — Appointment Management',
  description: 'Book doctors, manage appointments, prescriptions and billing in one calm clinic workspace.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </AuthProvider>
      </body>
    </html>
  );
}
