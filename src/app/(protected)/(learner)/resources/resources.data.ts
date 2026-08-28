export type ResourceType =
  | 'Video'
  | 'Article'
  | 'Document'
  | 'Interactive';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  category: string;
  author: string;
  level: string;
}

export const resources: Resource[] = [
  {
    id: 'javascript-functions',
    title: 'JavaScript Functions',
    description:
      'Learn how functions work and how to use them to write reusable JavaScript code.',
    type: 'Article',
    category: 'JavaScript',
    author: 'KodeCamp',
    level: 'Beginner',
  },
  {
    id: 'react-hooks',
    title: 'Understanding React Hooks',
    description:
      'A practical guide to understanding useState, useEffect and other React hooks.',
    type: 'Video',
    category: 'React',
    author: 'KodeCamp',
    level: 'Intermediate',
  },
  {
    id: 'typescript-guide',
    title: 'TypeScript Beginner Guide',
    description:
      'Understand the fundamentals of TypeScript and how it improves JavaScript projects.',
    type: 'Document',
    category: 'TypeScript',
    author: 'KodeCamp',
    level: 'Beginner',
  },
];