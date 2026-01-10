import { useState } from 'react';

interface RestaurantFiltersProps {
  onFilterChange: (filters: {
    state?: 'pending' | 'active' | 'upcoming' | 'visited';
    search?: string;
    sort?: 'date' | 'rating' | 'name';
  }) => void;
}

export function RestaurantFilters({ onFilterChange }: RestaurantFiltersProps) {
  const [state, setState] = useState<'pending' | 'active' | 'upcoming' | 'visited' | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'date' | 'rating' | 'name'>('name');

  const handleStateChange = (newState: typeof state) => {
    setState(newState);
    onFilterChange({
      state: newState === 'all' ? undefined : newState,
      search: search || undefined,
      sort,
    });
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    onFilterChange({
      state: state === 'all' ? undefined : state,
      search: newSearch || undefined,
      sort,
    });
  };

  const handleSortChange = (newSort: typeof sort) => {
    setSort(newSort);
    onFilterChange({
      state: state === 'all' ? undefined : state,
      search: search || undefined,
      sort: newSort,
    });
  };

  const filterButtonClass = (isActive: boolean) =>
    `px-4 py-2 rounded-lg font-medium transition-colors ${
      isActive
        ? 'bg-navy-900 text-white'
        : 'glass-button hover:bg-white/40'
    }`;

  return (
    <div className="glass-card p-6 mb-6 space-y-4">
      {/* State Filter Tabs */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Filter by State
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStateChange('all')}
            className={filterButtonClass(state === 'all')}
          >
            All
          </button>
          <button
            onClick={() => handleStateChange('pending')}
            className={filterButtonClass(state === 'pending')}
          >
            Pending
          </button>
          <button
            onClick={() => handleStateChange('active')}
            className={filterButtonClass(state === 'active')}
          >
            Active
          </button>
          <button
            onClick={() => handleStateChange('upcoming')}
            className={filterButtonClass(state === 'upcoming')}
          >
            Upcoming
          </button>
          <button
            onClick={() => handleStateChange('visited')}
            className={filterButtonClass(state === 'visited')}
          >
            Visited
          </button>
        </div>
      </div>

      {/* Search and Sort Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by name or address..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent"
          />
        </div>

        {/* Sort */}
        <div>
          <label htmlFor="sort" className="block text-sm font-semibold text-gray-700 mb-2">
            Sort By
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as typeof sort)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent"
          >
            <option value="date">Date Added</option>
            <option value="name">Name</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>
    </div>
  );
}
