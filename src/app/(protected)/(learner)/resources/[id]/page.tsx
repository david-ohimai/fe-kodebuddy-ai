import { notFound } from 'next/navigation';

import ResourceDetails from '../components/ResourceDetails';

const resources = [
  {
    id: 'javascript-functions-explained',
    title: 'JavaScript Functions Explained',
    description:
      'Master the core concepts of functions, including syntax, scope, and return values.',
    type: 'Article',
    category: 'Frontend Development',
    author: 'KodeCamp',
    level: 'Beginner',
    content:
      'JavaScript functions are reusable blocks of code designed to perform specific tasks. In this resource, you will learn how functions work, how to define them, how to pass arguments, and how to return values.',
    code: `function greet(name) {
  return "Hello, " + name;
}

console.log(greet("Faidah"));`,
  },
  {
    id: 'javascript-functions-beginner',
    title: 'JavaScript Functions — Beginner Guide',
    description:
      'An in-depth article covering everything from basic declarations to arrow functions.',
    type: 'Article',
    category: 'Frontend Development',
    author: 'KodeCamp',
    level: 'Beginner',
    content:
      'This beginner-friendly guide introduces JavaScript functions from the basics. You will learn about function declarations, parameters, arguments, return values, and arrow functions.',
    code: `function add(a, b) {
  return a + b;
}

const result = add(5, 3);

console.log(result);`,
  },
  {
    id: 'javascript-fundamentals-cheat-sheet',
    title: 'JavaScript Fundamentals Cheat Sheet',
    description:
      'Quick reference guide for variables, loops, and function syntax.',
    type: 'Document',
    category: 'Frontend Development',
    author: 'KodeCamp',
    level: 'Beginner',
    content:
      'This cheat sheet provides a quick reference for some of the most important JavaScript fundamentals, including variables, data types, loops, conditions, and functions.',
    code: `const name = "Faidah";
let age = 25;

if (age >= 18) {
  console.log(name + " is an adult");
}`,
  },
  {
    id: 'practice-javascript-functions',
    title: 'Practice JavaScript Functions',
    description:
      'Interactive coding challenges to reinforce your understanding of function logic.',
    type: 'Interactive',
    category: 'Frontend Development',
    author: 'KodeCamp',
    level: 'Beginner',
    content:
      'Practice your JavaScript function skills with coding challenges designed to help you understand how functions work and how to solve problems using reusable blocks of code.',
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
