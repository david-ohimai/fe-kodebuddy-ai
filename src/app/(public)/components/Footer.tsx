import Link from 'next/link';
import AppLogo from '@/components/layout/AppLogo';

const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#learning-space' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'For Trainers', href: '#' },
    ],
  },
  {
    title: 'Access',
    links: [
      { label: 'Learner login', href: '/sign-in' },
      { label: 'Register', href: '/sign-up' },
      { label: 'Password Reset', href: '/forgot-password' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Centre', href: '#' },
      { label: 'Contact Us', href: '#' },
      { label: 'System Status', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Accessibility', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-disabled bg-background px-5 pt-10 sm:px-8">
      <div className="mx-auto grid max-w-[1216px] gap-10 pb-9 lg:grid-cols-[260px_1fr] lg:gap-24">
        <div className="max-w-[260px]">
          <AppLogo withTitle width={150} height={29} />
          <p className="f1-r mt-4 max-w-[240px] text-muted">
            KodeCamp&apos;s AI learning assistant. Curriculum-based guidance
            with human oversight built in.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="f1-b text-primary">{column.title}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="f1-r text-muted transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-disabled">
        <div className="mx-auto flex max-w-[1216px] flex-col gap-3 py-4 text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="f1-r">
            © {new Date().getFullYear()} KodeBuddy AI · KodeCamp Learning
            Platform
          </p>
          <p className="f1-r">Built for the KodeCamp Capstone Project</p>
        </div>
      </div>
    </footer>
  );
}
