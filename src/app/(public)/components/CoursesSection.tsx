import AppButton from '@/components/ui/AppButton';

// TODO: build out per the "Find a course that fits your goal" section of
// the Figma — the 3 course cards (Data Analysis, UI/UX Design, Product
// Management) and "Explore courses" action.
export default function CoursesSection() {
  return (
    <section id="courses" className="mx-auto max-w-6xl px-6 py-20 text-center">
      <p className="b2-b text-primary">Explore courses</p>
      <h2 className="h3-b mt-2 text-text">Find a course that fits your goal</h2>
      <p className="b1-r mt-2 text-text-secondary">
        Explore practical learning opportunities from the KodeCamp ecosystem.
      </p>
      <AppButton
        href="#courses"
        variant="outlined"
        radius="full"
        className="mt-6"
      >
        Explore courses
      </AppButton>
    </section>
  );
}
