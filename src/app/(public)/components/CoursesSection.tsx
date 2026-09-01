import dataAnalysisImage from '@/assets/images/landing/course-data-analysis.png';
import productImage from '@/assets/images/landing/course-product-management.png';
import uiUxImage from '@/assets/images/landing/course-ui-ux.png';
import CourseCard from './CourseCard';
import LandingOutlineButton from './LandingOutlineButton';
import SectionHeader from './SectionHeader';

const COURSES = [
  {
    title: 'Data Analysis',
    level: 'Intermediate',
    description: 'Work with data, draw insights, and present findings clearly.',
    image: dataAnalysisImage,
    href: '#courses',
  },
  {
    title: 'UI/UX Design',
    level: 'Intermediate',
    description: 'Design usable interfaces and practical digital experiences.',
    image: uiUxImage,
    href: '#courses',
  },
  {
    title: 'Product Management',
    level: 'Intermediate',
    description: 'Plan, prioritise, and guide products from idea to delivery.',
    image: productImage,
    href: '#courses',
  },
];

export default function CoursesSection() {
  return (
    <section
      id="courses"
      className="scroll-mt-24 bg-[#f8fbfd] px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-[1320px]">
        <SectionHeader
          badge="Explore courses"
          title="Find a course that fits your goal"
          description="Explore practical learning opportunities from the KodeCamp ecosystem."
          className="max-w-[860px]"
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3 lg:gap-6">
          {COURSES.map((course) => (
            <CourseCard key={course.title} {...course} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <LandingOutlineButton href="#courses" className="w-fit">
            Explore courses
          </LandingOutlineButton>
        </div>
      </div>
    </section>
  );
}
