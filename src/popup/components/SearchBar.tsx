import React, { useRef, useCallback } from 'react';
import { Search, X, Clock, Star, Globe } from 'lucide-react';
import { useVicPicStore } from '../store/useVicPicStore';
import type { FilterType } from '../../shared/types';

const FILTERS: { value: FilterType; label: string; icon: React.ReactNode }[] = [
  { value: 'all',       label: 'All',    icon: <Globe size={10} /> },
  { value: 'recent',   label: 'Recent', icon: <Clock size={10} /> },
  { value: 'favorites',label: 'Faves',  icon: <Star  size={10} /> },
];

export const SearchBar: React.FC = () => {
  const search       = useVicPicStore((s) => s.search);
  const filter       = useVicPicStore((s) => s.filter);
  const domainFilter = useVicPicStore((s) => s.domainFilter);
  const setSearch    = useVicPicStore((s) => s.setSearch);
  const setFilter    = useVicPicStore((s) => s.setFilter);
  const setDomainFilter = useVicPicStore((s) => s.setDomainFilter);
  const domains      = useVicPicStore((s) => s.getDomains());

  const inputRef   = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((val: string) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(val), 150);
  }, [setSearch]);

  const clearSearch = () => {
    setSearch('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="vp-searchbar">
      {/* Input */}
      <div className="vp-search-wrap">
        <Search size={13} className="vp-search-icon" style={{ color: search ? '#00d4ff' : 'rgba(255,255,255,0.25)' }} />
        <input
          ref={inputRef}
          type="text"
          defaultValue={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search images, domains..."
          className="vp-search-input"
        />
        {search && (
          <button onClick={clearSearch} className="vp-search-clear">
            <X size={12} color="rgba(255,255,255,0.6)" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="vp-filters">
        {FILTERS.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`vp-filter-btn ${filter === value ? 'vp-filter-active' : ''}`}
          >
            {icon}{label}
          </button>
        ))}

        {domains.length > 0 && (
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className={`vp-domain-select ${domainFilter ? 'vp-domain-active' : ''}`}
          >
            <option value="">All Sites</option>
            {domains.slice(0, 8).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};