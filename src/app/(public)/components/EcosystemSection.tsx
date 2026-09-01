import Link from 'next/link';

// TODO: build out per the "Learning with KodeBuddy starts with
// KodeCamp" section of the Figma — the ecosystem illustration and
// "Learn more about KodeCamp" link.
export default function EcosystemSection() {
  return (
    <section id="ecosystem" className="bg-disabled/30 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="b2-b text-primary">Part of the KodeCamp learning ecosystem</p>
        <h2 className="h3-b mt-2 max-w-md text-text">
          Learning with KodeBuddy starts with KodeCamp
        </h2>
        <p className="b1-r mt-2 max-w-md text-text-secondary">
          KodeBuddy is the digital learning space within KodeCamp, bringing
          your learning experience into one structured place.
        </p>
        <Link
          href="#"
          className="b2-b mt-4 inline-block text-primary hover:underline"
        >
          Learn more about KodeCamp →
        </Link>
      </div>
    </section>
  );
}
