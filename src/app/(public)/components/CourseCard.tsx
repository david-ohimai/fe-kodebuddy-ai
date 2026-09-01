import Image, { type StaticImageData } from 'next/image';
import LandingOutlineButton from './LandingOutlineButton';

interface CourseCardProps {
  description: string;
  href: string;
  image: StaticImageData;
  level: string;
  title: string;
}

export default function CourseCard({
  description,
  href,
  image,
  level,
  title,
}: CourseCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-disabled bg-white p-4 text-left shadow-[0_12px_30px_rgba(17,24,39,0.06)]">
      <Image
        src={image}
        alt={`${title} course`}
        className="aspect-[16/9] w-full rounded-md object-cover"
      />
      <div className="mt-4">
        <div className="flex items-center gap-3">
          <p className="b1-b text-text">{title}</p>
          <span className="rounded-full bg-primary-light px-2.5 py-1 f2-b text-primary">
            {level}
          </span>
        </div>
        <p className="b2-r mt-2 min-h-10 text-text-secondary">{description}</p>
        <LandingOutlineButton href={href} size="small" className="mt-4">
          View course
        </LandingOutlineButton>
      </div>
    </article>
  );
}
