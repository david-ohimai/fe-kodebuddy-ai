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
    // First paragraph is the summary shown on the overview card; the rest is
    // the Description section body.
    description: [
      'Practice building responsive, reusable layouts using Auto-layout so your components adapt cleanly across screen sizes — the foundation every design system component depends on',
      'Auto-layout is the difference between a component that looks good in one screenshot and one that survives real content — longer text, missing images, different screen widths.',
      "You'll build two components, a card and a navigation bar, entirely using Auto-layout with no manual positioning. Both should resize predictably when their content changes, the same way a production component behaves in a live product.",
    ].join('\n\n'),

    // Steps are newline-separated inside one description, which is how the
    // detail screen splits them into a numbered list.
    instructions: [
      {
        title: 'Part A - Card Component',
        description: [
          'Create a new Figma file named Module2_[Your Name].',
          'Build a card frame containing: image placeholder, title text, description text, and a button.',
          'Apply vertical Auto-layout to the card — set consistent spacing between elements (recommend 12–16px).',
          'Set padding on the outer frame (recommend 16–24px on all sides).',
        ].join('\n'),
      },
      {
        title: 'Part B - Navigation Bar',
        description: [
          'Build a horizontal nav with a logo on the left, four links and an avatar on the right.',
          'Apply horizontal Auto-layout with space-between alignment.',
          'Use the spacing tokens from the Module 2 session rather than hand-typed pixel values.',
          'Set a fixed height and let the width fill its container.',
        ].join('\n'),
      },
      {
        title: 'Part C - Submission Prep',
        description: [
          'Duplicate both components and stress-test them: double the title length, remove the image, and resize the frame to 375px.',
          'Rename every layer meaningfully, then share the file with view access and paste the link below.',
        ].join('\n'),
      },
    ],

    requirements: [
      {
        title: 'Card uses vertical component',
        description: 'No absolute or manual positioning',
      },
      {
        title: 'Card resizes correctly',
        description: 'Grows vertically when description length changes',
      },
      {
        title: 'Nav bar uses horizontal Auto-layout',
        description: 'Correct space-between alignment',
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
    submittedAt: null,
    submissionContent: null,
    feedback: null,
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
    submittedAt: '2026-01-17T14:20:00Z',
    submissionContent: 'https://www.figma.com/file/example-colour-type-scale',
    feedback:
      'Strong palette. Watch the 14px body on the neutral-200 background — it lands just under AA.',
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
    submittedAt: '2026-02-10T09:05:00Z',
    submissionContent: 'https://www.figma.com/file/example-button-variants',
    feedback: null,
  },
];
