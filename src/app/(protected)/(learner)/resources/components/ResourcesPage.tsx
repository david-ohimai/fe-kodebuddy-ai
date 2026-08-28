'use client';



import { useMemo, useState } from 'react';



import PageHeader from '@/components/ui/AppPageHeader';

import { AppCard } from '@/components/ui/AppCard';



import ResourceCard from './ResourceCard';



type ResourceType = 'Video' | 'Article' | 'Document' | 'Interactive';



type Resource = {

  id: string;

  title: string;

  description: string;

  type: ResourceType;

  category: string;

  author: string;

  level: string;

};



const resources: Resource[] = [

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



const filters: Array<'All Resources' | ResourceType> = [

  'All Resources',

  'Video',

  'Article',

  'Document',

  'Interactive',

];



export default function ResourcesPage() {

  const [search, setSearch] = useState('');

  const [activeFilter, setActiveFilter] =

    useState<'All Resources' | ResourceType>('All Resources');



  const filteredResources = useMemo(() => {

    const query = search.trim().toLowerCase();



    return resources.filter((resource) => {

      const matchesSearch =

        !query ||

        resource.title.toLowerCase().includes(query) ||

        resource.description.toLowerCase().includes(query) ||

        resource.category.toLowerCase().includes(query);



      const matchesFilter =

        activeFilter === 'All Resources' ||

        resource.type === activeFilter;



      return matchesSearch && matchesFilter;

    });

  }, [search, activeFilter]);



  return (

    <div className="flex flex-col gap-6">

      <PageHeader

        title="Resources"

        subtitle="Extra material to support your learning."

      />



      {/* Search + filters */}

      <AppCard padding="md">

        <div className="flex flex-col gap-5">

          <div>

            <label

              htmlFor="resource-search"

              className="sr-only"

            >

              Search resources

            </label>



            <input

              id="resource-search"

              type="search"

              value={search}

              onChange={(event) => setSearch(event.target.value)}

              placeholder="Search resources..."

              className="w-full rounded-lg border border-disabled bg-background px-4 py-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"

            />

          </div>



          <div className="flex flex-wrap gap-2">

            {filters.map((filter) => {

              const isActive = activeFilter === filter;



              return (

                <button

                  key={filter}

                  type="button"

                  onClick={() => setActiveFilter(filter)}

                  className={[

                    'rounded-full px-4 py-2 text-sm font-medium transition',

                    isActive

                      ? 'bg-primary text-white'

                      : 'bg-disabled text-text-secondary hover:bg-primary-light hover:text-primary',

                  ].join(' ')}

                >

                  {filter}

                </button>

              );

            })}

          </div>

        </div>

      </AppCard>



      {/* Results */}

      {filteredResources.length > 0 ? (

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

          {filteredResources.map((resource) => (

            <ResourceCard

              key={resource.id}

              resource={resource}

            />

          ))}

        </div>

      ) : (

        <AppCard padding="lg">

          <div className="flex min-h-[280px] flex-col items-center justify-center text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-xl text-primary">

              🔍

            </div>



            <h2 className="mt-5 text-lg font-semibold text-text-primary">

              No resources found

            </h2>



            <p className="mt-2 max-w-md text-sm text-text-secondary">

              We couldn't find any resources matching your search or filter.

            </p>

          </div>

        </AppCard>

      )}

    </div>

  );

}



