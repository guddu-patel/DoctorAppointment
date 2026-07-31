import Link from 'next/link';
import { APP_NAME } from '@/config';

export default function TermsPage() {
  return (
    <div className="container-page py-16 max-w-3xl">
      <Link href="/" className="text-[var(--brand)] font-semibold">{APP_NAME}</Link>
      <h1 className="font-display text-4xl mt-4">Terms of Service</h1>
      <p className="mt-4 text-[var(--ink-muted)]">
        {APP_NAME} helps clinics manage appointments and related workflows. It does not replace professional medical advice.
        Users are responsible for accurate registration details and timely attendance.
      </p>
    </div>
  );
}
