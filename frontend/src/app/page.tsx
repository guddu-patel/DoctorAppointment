'use client';

import Link from 'next/link';
import { ArrowRight, CalendarCheck2, HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';
import { APP_NAME } from '@/config';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="container-page flex items-center justify-between py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-10 w-10 rounded-2xl bg-[var(--brand)] text-white grid place-items-center shadow-[0_10px_24px_rgba(13,110,86,0.3)]">
            <Stethoscope size={18} />
          </span>
          <span className="font-display text-2xl text-[var(--brand-deep)]">{APP_NAME}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[var(--ink-muted)]">
          <a href="#services">Services</a>
          <Link href="/doctors">Doctors</Link>
          <a href="#about">About</a>
          <Link href="/login" className="btn btn-secondary !py-2">Sign in</Link>
          <Link href="/register" className="btn btn-primary !py-2">Get started</Link>
        </nav>
        <div className="md:hidden flex gap-2">
          <Link href="/login" className="btn btn-secondary !py-2 !px-3">Sign in</Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              'linear-gradient(120deg, rgba(8,76,59,0.88), rgba(13,110,86,0.55)), url(https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1800&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container-page min-h-[78vh] flex flex-col justify-end pb-16 pt-28 text-white fade-up">
          <p className="uppercase tracking-[0.2em] text-sm text-white/75 mb-4">Clinic-grade scheduling</p>
          <h1 className="font-display text-5xl md:text-7xl max-w-3xl leading-[1.05]">
            {APP_NAME}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            Book trusted doctors, skip the waiting room chaos, and keep prescriptions, payments, and history in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn bg-white text-[var(--brand-deep)] hover:bg-[var(--brand-soft)]">
              Book an appointment <ArrowRight size={16} />
            </Link>
            <Link href="/doctors" className="btn border border-white/40 text-white bg-white/10 backdrop-blur">
              Browse doctors
            </Link>
          </div>
        </div>
      </section>

      <section id="services" className="container-page py-20">
        <div className="max-w-2xl fade-up">
          <h2 className="font-display text-4xl text-[var(--brand-deep)]">Care that stays organized</h2>
          <p className="mt-3 text-[var(--ink-muted)]">
            Patients, doctors, and staff share one live timeline — from booking to checkout.
          </p>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            {
              icon: <CalendarCheck2 className="text-[var(--brand)]" />,
              title: 'Smart booking',
              text: 'Live slots, reminders, and queue numbers that keep visits on time.',
            },
            {
              icon: <HeartPulse className="text-[var(--accent)]" />,
              title: 'Clinical continuity',
              text: 'Prescriptions, history, and follow-ups stay attached to every visit.',
            },
            {
              icon: <ShieldCheck className="text-[var(--brand-deep)]" />,
              title: 'Role-ready access',
              text: 'Admin, doctor, staff, and patient workspaces with clear permissions.',
            },
          ].map((card) => (
            <article key={card.title} className="glass-panel p-6">
              <div className="h-11 w-11 rounded-xl bg-[var(--brand-soft)] grid place-items-center mb-4">
                {card.icon}
              </div>
              <h3 className="font-display text-2xl">{card.title}</h3>
              <p className="mt-2 text-[var(--ink-muted)]">{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="container-page pb-20">
        <div className="glass-panel overflow-hidden grid md:grid-cols-2">
          <div
            className="min-h-[280px]"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <h2 className="font-display text-3xl text-[var(--brand-deep)]">Built for real clinic days</h2>
            <p className="mt-3 text-[var(--ink-muted)]">
              From walk-in registration to invoice printouts, {APP_NAME} keeps reception, consultation, and billing moving together.
            </p>
            <Link href="/register" className="btn btn-primary mt-6 w-fit">
              Create patient account
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] py-8">
        <div className="container-page flex flex-col md:flex-row gap-3 items-center justify-between text-sm text-[var(--ink-muted)]">
          <span>© {new Date().getFullYear()} {APP_NAME}</span>
          <div className="flex gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
