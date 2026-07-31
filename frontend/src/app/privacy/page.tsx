import Link from 'next/link';
import { APP_NAME } from '@/config';

export default function PrivacyPage() {
  return (
    <div className="container-page py-16 max-w-3xl">
      <Link href="/" className="text-[var(--brand)] font-semibold">{APP_NAME}</Link>
      <h1 className="font-display text-4xl mt-4">Privacy Policy</h1>
      <p className="mt-4 text-[var(--ink-muted)]">
        We collect account and appointment information only to deliver clinical scheduling, billing, and care continuity.
        Medical data is accessible to authorized clinic roles and the patient who owns the record.
      </p>
    </div>
  );
}
