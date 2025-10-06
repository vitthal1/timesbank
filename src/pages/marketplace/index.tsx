// src/pages/marketplace/index.tsx - FIXED: Shows all active services
import { useState, useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getServiceOfferings, subscribeToUserOfferings } from '../../services/serviceOfferingsService';
import ServiceCard from '../../components/Marketplace/ServiceCard';
import type { ServiceOffering, User, Skill } from '../../types';
import { useInView } from 'react-intersection-observer';

const PAGE_SIZE = 10;

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | 'technology' | 'creative' | 'education' | 'health' | 'business' | 'trades' | 'other'
  >('all');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const delay = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const {
    data: { pages = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['serviceOfferings', { debouncedSearch, categoryFilter }],
    queryFn: async ({ pageParam = 0 }) => {
      const start = Number(pageParam);
      // FIXED: Pass 'active' filter to only show active services
      const data = await getServiceOfferings(debouncedSearch, categoryFilter, [start, start + PAGE_SIZE - 1], 'active');
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Fetched ${data?.length || 0} offerings from ${start} to ${start + PAGE_SIZE - 1}`);
      }
      
      return data as (ServiceOffering & {
        users: Pick<User, 'username' | 'avatar_url' | 'location' | 'rating'>;
        skills?: Pick<Skill, 'name' | 'category'>;
      })[];
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.flat().length : undefined,
    initialPageParam: 0,
  });

  const { ref, inView } = useInView({ threshold: 0.3 });
  
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const unsubscribe = subscribeToUserOfferings('', (updatedOfferings) => {
      if (updatedOfferings.some((o) => o.status === 'active')) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Real-time update detected, refetching...');
        }
        refetch();
      }
    });
    return unsubscribe;
  }, [refetch]);

  const flattenedOfferings = useMemo(() => pages.flat(), [pages]);

  if (isLoading && flattenedOfferings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Marketplace</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore community-driven services. Search, filter, and collaborate instantly.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-sm text-blue-600 mt-2">
              Debug: Showing {flattenedOfferings.length} active offerings
            </p>
          )}
        </header>

        {/* Filters */}
        <section className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              aria-label="Search services"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="technology">Technology</option>
              <option value="creative">Creative</option>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="business">Business</option>
              <option value="trades">Trades</option>
              <option value="other">Other</option>
            </select>
          </div>
        </section>

        {/* Grid of Offerings */}
        {flattenedOfferings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flattenedOfferings.map((offering) => (
              <ServiceCard
                key={offering.id}
                offering={{ ...offering, provider: offering.users }}
              />
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">No matching services found.</p>
              <p className="text-gray-400 mt-2">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Try refining your search or selecting a different category.' 
                  : 'Be the first to create a service offering!'}
              </p>
            </div>
          )
        )}

        {/* Infinite Scroll Loader */}
        <div ref={ref} className="flex justify-center py-8">
          {isFetchingNextPage && (
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
          )}
        </div>
      </div>
    </div>
  );
}