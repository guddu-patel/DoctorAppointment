import Link from 'next/link';
import { APP_NAME } from '@/config';

export default function ContactPage() {
  return (
    <div className="container-page py-16 max-w-3xl">
      <Link href="/" className="text-[var(--brand)] font-semibold">{APP_NAME}</Link>
      <h1 className="font-display text-4xl mt-4">Contact</h1>
      <p className="mt-4 text-[var(--ink-muted)]">
        Reach the clinic desk at <strong>hello@doctorcare.local</strong> or call <strong>+91-90000-00000</strong>.
      </p>
    </div>
  );
}
