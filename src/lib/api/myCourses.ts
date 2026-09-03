import * as cohortsApi from './cohorts.api';
import * as coursesApi from './courses.api';
import { getCurrentProfile } from './auth.api';

export interface MyCourseRef {
  courseId: number;
  courseTitle: string;
  cohortId: number;
}

export async function listMyCourses(): Promise<MyCourseRef[]> {
  const me = await getCurrentProfile();

  const [cohorts, courses] = await Promise.all([
    cohortsApi.listCohorts(),
    coursesApi.listCourses(),
  ]);

  const memberships = await Promise.all(
    cohorts.map((cohort) =>
      cohortsApi
        .getCohortLearners(cohort.id)
        .then((learners) => ({
          cohort,
          isMember: learners.some((l) => l.learnerId === me.id && l.isActive),
        }))
        .catch(() => ({ cohort, isMember: false })),
    ),
  );

  return memberships
    .filter((m) => m.isMember)
    .map((m) => {
      const course = courses.find((c) => c.cohortId === m.cohort.id);
      return course && course.isActive
        ? {
            courseId: course.id,
            courseTitle: course.title,
            cohortId: m.cohort.id,
          }
        : null;
    })
    .filter((c): c is MyCourseRef => !!c);
}
