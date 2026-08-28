// Demo fixtures for the Learner assignments feature.
//
// These exist because the backend has the endpoints but the demo environment
// may have no seeded course/module/assignment rows for the signed-in learner.
// They are ONLY used when `shouldUseFallback()` says so — see
// lib/api/assignments.api.ts. Real data always wins.
//
// Content mirrors the Module 2 assignment in the Figma so the demo matches the
// design frame-for-frame.

import type { LearnerAssignment } from '@/types/assignment.types';

export const DEMO_ASSIGNMENTS: LearnerAssignment[] = [
  {
    id: 1,
    moduleId: 2,
    moduleTitle: 'Layout Foundations',
    moduleOrder: 2,
    courseId: 1,
    courseTitle: 'Product Design Fundamentals',

    title: 'Layout Vs. Autolayout',
    description:
      'Practice building responsive, reusable layouts using Auto-layout so your components adapt cleanly across screen sizes — the foundation every design system component depends on',

    instructions: [
      {
        title: 'Part A — Build a card component',
        description:
          'Create a card containing an image, a title, a description and a button. Every element must be positioned by Auto-layout — no manual X/Y placement anywhere in the frame.',
      },
      {
        title: 'Part B — Build a navigation bar',
        description:
          'Build a horizontal nav with a logo on the left and four links plus an avatar on the right. Use spacing tokens from the Module 2 session rather than hand-typed pixel values.',
      },
      {
        title: 'Part C — Prove it resizes',
        description:
          'Duplicate both components and stress-test them: double the title length, remove the image, and resize the frame to 375px. Neither component may break or overlap.',
      },
    ],

    requirements: [
      {
        title: 'Auto-layout only',
        description:
          'No absolute positioning. Every frame in the submission uses Auto-layout with explicit padding and gap values.',
      },
      {
        title: 'Named layers',
        description:
          'Layers carry meaningful names. "Frame 247" will be sent back for a rename.',
      },
      {
        title: 'One Figma link',
        description:
          'Submit a single share link with view access enabled, containing both components on one page.',
      },
    ],

    dueDate: '2026-02-01T23:59:00Z',
    maximumScore: 100,
    isActive: true,

    status: 'in-progress',
    submitted: false,
    graded: false,
    score: null,
    isOverdue: false,
  },

  {
    id: 2,
    moduleId: 1,
    moduleTitle: 'Design Foundations',
    moduleOrder: 1,
    courseId: 1,
    courseTitle: 'Product Design Fundamentals',

    title: 'Colour & Type Scale',
    description:
      'Define a colour palette and a type scale, then apply both consistently across three sample screens.',

    instructions: [
      {
        title: 'Build the palette',
        description:
          'Pick a primary, a neutral ramp and two semantic colours. Document the intended use of each.',
      },
      {
        title: 'Apply it',
        description:
          'Restyle the three provided screens using only tokens from your palette and scale.',
      },
    ],

    requirements: [
      {
        title: 'Contrast passes AA',
        description:
          'Every text/background pairing meets WCAG AA at its rendered size.',
      },
    ],

    dueDate: '2026-01-18T23:59:00Z',
    maximumScore: 100,
    isActive: true,

    status: 'graded',
    submitted: true,
    graded: true,
    score: 88,
    isOverdue: false,
  },

  {
    id: 3,
    moduleId: 3,
    moduleTitle: 'Components & Variants',
    moduleOrder: 3,
    courseId: 1,
    courseTitle: 'Product Design Fundamentals',

    title: 'Button Variants',
    description:
      'Build one button component with variants for state, size and hierarchy, driven by component properties.',

    instructions: [
      {
        title: 'Create the variant matrix',
        description:
          'Three hierarchies × three sizes × four states, as a single component set.',
      },
    ],

    requirements: [
      {
        title: 'One component set',
        description:
          'All variants live in a single set — not twelve separate components.',
      },
    ],

    dueDate: '2026-02-14T23:59:00Z',
    maximumScore: 100,
    isActive: true,

    status: 'submitted',
    submitted: true,
    graded: false,
    score: null,
    isOverdue: false,
  },
];
