import Link from 'next/link';
import AppLogo from '@/components/layout/AppLogo';

// TODO: build out per the footer in the landing page Figma — the
// Product / Access / Support / Legal link columns.
const FOOTER_COLUMNS = [
  { title: 'Product', links: ['Features', 'How it works'] },
  { title: 'Access', links: ['Learner login', 'Register'] },
  { title: 'Support', links: ['Help Centre', 'Contact Us'] },
  { title: 'Legal', links: ['Privacy Policy', 'Terms of Service'] },
];

export default function Footer() {
  return (
    <footer className="border-t border-disabled px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <AppLogo withTitle width={130} height={26} />
          <p className="f1-r mt-3 text-muted">
            KodeCamp&apos;s AI learning assistant. Curriculum-based guidance
            with human oversight built in.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="b2-b text-text">{column.title}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="f1-r text-muted hover:text-text">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="f1-r mt-10 text-center text-muted">
        © {new Date().getFullYear()} KodeBuddy AI. KodeCamp Learning Platform.
      </p>
    </footer>
  );
}
