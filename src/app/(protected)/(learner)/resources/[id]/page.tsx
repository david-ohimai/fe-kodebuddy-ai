import { notFound } from 'next/navigation';

import ResourceDetails from '../components/ResourceDetails';

const resources = [
  {
    id: 'javascript-functions',
    title: 'JavaScript Functions',
    description:
      'Learn how functions work and how to use them to write reusable JavaScript code.',
    type: 'Article',
    category: 'JavaScript',
    author: 'KodeCamp',
    level: 'Beginner',
    content:
      'Functions are reusable blocks of code that perform a specific task. They help developers organise code and avoid repeating the same instructions.',
    code: `function greet(name) {
  return "Hello, " + name;
}

console.log(greet("Faidah"));`,
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
    content:
      'React Hooks allow functional components to use state and other React features without writing class components.',
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
    content:
      'TypeScript adds static typing to JavaScript, helping developers catch errors earlier and build more maintainable applications.',
  },
];

interface ResourceDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ResourceDetailsPage({
  params,
}: ResourceDetailsPageProps) {
  const { id } = await params;

  const resource = resources.find((item) => item.id === id);

  if (!resource) {
    notFound();
  }

  return <ResourceDetails resource={resource} />;
}