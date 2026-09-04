import type { LearnerResource } from '@/types/resource.types';

export const DEMO_RESOURCES: LearnerResource[] = [
  {
    id: -1,
    moduleId: -1,
    title: 'JavaScript Functions Explained',
    description:
      'Master the core concepts of functions, including syntax, scope, and return values.',
    type: 'Article',
    rawType: 'article',
    url: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    moduleTitle: 'JavaScript Fundamentals',
    courseId: -1,
    courseTitle: 'Frontend Development',
  },
  {
    id: -2,
    moduleId: -1,
    title: 'JavaScript Functions — Beginner Guide',
    description:
      'An in-depth guide covering everything from basic declarations to arrow functions.',
    type: 'Article',
    rawType: 'article',
    url: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    moduleTitle: 'JavaScript Fundamentals',
    courseId: -1,
    courseTitle: 'Frontend Development',
  },
  {
    id: -3,
    moduleId: -1,
    title: 'JavaScript Fundamentals Cheat Sheet',
    description:
      'Quick reference guide for variables, loops, and function syntax.',
    type: 'Document',
    rawType: 'document',
    url: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    moduleTitle: 'JavaScript Fundamentals',
    courseId: -1,
    courseTitle: 'Frontend Development',
  },
  {
    id: -4,
    moduleId: -1,
    title: 'Practice JavaScript Functions',
    description:
      'Interactive coding challenges to reinforce your understanding of function logic.',
    type: 'Interactive',
    rawType: 'interactive',
    url: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    moduleTitle: 'JavaScript Fundamentals',
    courseId: -1,
    courseTitle: 'Frontend Development',
  },
];
