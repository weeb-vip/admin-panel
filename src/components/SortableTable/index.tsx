import React, { useState, useMemo, useEffect, useRef } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface FilterConfig<T> {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect';
  options?: { value: string; label: string }[];
  filterFn?: (item: T, value: any) => boolean;
  getFilterValue?: (item: T) => string;
}

export interface SortableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  className?: string;
  filterable?: boolean;
  filterType?: 'text' | 'select';
  filterOptions?: { value: string; label: string }[];
  getFilterValue?: (item: T) => string;
}

interface SortableTableProps<T> {
  data: T[];
  columns: SortableColumn<T>[];
  renderRow: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  initialSort?: { key: string; direction: SortDirection };
  filters?: FilterConfig<T>[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
}

function SortableTable<T>({
  data,
  columns,
  renderRow,
  className = "min-w-full divide-y divide-gray-200",
  headerClassName = "bg-gray-50",
  bodyClassName = "bg-white divide-y divide-gray-200",
  initialSort,
  filters = [],
  showSearch = false,
  searchPlaceholder = "Search...",
  searchKeys = []
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(initialSort?.key || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSort?.direction || null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  const [openFilterColumn, setOpenFilterColumn] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setOpenFilterColumn(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortKey === columnKey) {
      // Cycle through: asc -> desc -> null
      setSortDirection(prev => {
        if (prev === 'asc') return 'desc';
        if (prev === 'desc') return null;
        return 'asc';
      });
      if (sortDirection === 'desc') {
        setSortKey(null);
      }
    } else {
      setSortKey(columnKey);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (filterKey: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const handleColumnFilterChange = (columnKey: string, value: any) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (showSearch && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        if (searchKeys.length > 0) {
          return searchKeys.some(key => {
            const value = (item as any)[key];
            return value && value.toString().toLowerCase().includes(query);
          });
        }
        // Fallback: search in all string properties
        return Object.values(item as any).some(value =>
          value && typeof value === 'string' && value.toLowerCase().includes(query)
        );
      });
    }

    // Apply custom filters
    filters.forEach(filter => {
      const filterValue = filterValues[filter.key];
      if (filterValue !== undefined && filterValue !== '') {
        if (filter.filterFn) {
          filtered = filtered.filter(item => filter.filterFn!(item, filterValue));
        } else if (filter.getFilterValue) {
          if (filter.type === 'multiselect' && Array.isArray(filterValue)) {
            if (filterValue.length > 0) {
              filtered = filtered.filter(item =>
                filterValue.includes(filter.getFilterValue!(item))
              );
            }
          } else {
            filtered = filtered.filter(item =>
              filter.getFilterValue!(item) === filterValue
            );
          }
        }
      }
    });

    // Apply column filters
    columns.forEach(column => {
      const filterValue = columnFilters[column.key];
      if (column.filterable && filterValue !== undefined && filterValue !== '') {
        if (column.getFilterValue) {
          if (column.filterType === 'text') {
            const query = filterValue.toLowerCase();
            filtered = filtered.filter(item => {
              const value = column.getFilterValue!(item);
              return value && value.toLowerCase().includes(query);
            });
          } else {
            filtered = filtered.filter(item =>
              column.getFilterValue!(item) === filterValue
            );
          }
        }
      }
    });

    // Apply sorting
    if (sortKey && sortDirection) {
      const column = columns.find(col => col.key === sortKey);
      if (column?.sortFn) {
        filtered.sort(column.sortFn);
        if (sortDirection === 'desc') {
          filtered.reverse();
        }
      }
    }

    return filtered;
  }, [data, sortKey, sortDirection, columns, searchQuery, filterValues, filters, showSearch, searchKeys, columnFilters]);

  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    }

    if (sortDirection === 'asc') {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4 ml-1 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div ref={tableRef}>
      {/* Search and Filters */}
      {(showSearch || filters.length > 0) && (
        <div className="mb-4 space-y-4">
          {/* Search Bar */}
          {showSearch && (
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg
                  className="absolute right-3 top-2.5 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Filters */}
          {filters.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {filters.map((filter) => (
                <div key={filter.key} className="flex flex-col">
                  <label className="text-xs font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  {filter.type === 'text' && (
                    <input
                      type="text"
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                  {filter.type === 'select' && (
                    <select
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All</option>
                      {filter.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {filter.type === 'multiselect' && (
                    <select
                      multiple
                      value={filterValues[filter.key] || []}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        handleFilterChange(filter.key, values);
                      }}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      size={Math.min(filter.options?.length || 1, 4)}
                    >
                      {filter.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      {(showSearch || filters.length > 0) && (
        <div className="mb-2 text-sm text-gray-600">
          Showing {filteredAndSortedData.length} of {data.length} results
        </div>
      )}

      {/* Table */}
      <table className={className}>
        <thead className={headerClassName}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative ${column.className || ''}`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center ${column.sortable ? 'cursor-pointer hover:text-gray-700' : ''}`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    {column.label}
                    {column.sortable && getSortIcon(column.key)}
                  </div>

                  {column.filterable && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenFilterColumn(openFilterColumn === column.key ? null : column.key);
                        }}
                        className={`ml-1 p-1 rounded hover:bg-gray-200 ${
                          columnFilters[column.key] ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {openFilterColumn === column.key && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px]">
                          <div className="p-3">
                            {column.filterType === 'text' ? (
                              <input
                                type="text"
                                placeholder={`Filter ${column.label}...`}
                                value={columnFilters[column.key] || ''}
                                onChange={(e) => handleColumnFilterChange(column.key, e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                autoFocus
                              />
                            ) : (
                              <select
                                value={columnFilters[column.key] || ''}
                                onChange={(e) => handleColumnFilterChange(column.key, e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">All</option>
                                {column.filterOptions?.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            )}
                            {columnFilters[column.key] && (
                              <button
                                type="button"
                                onClick={() => handleColumnFilterChange(column.key, '')}
                                className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                              >
                                Clear filter
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={bodyClassName}>
          {filteredAndSortedData.map((item, index) => renderRow(item, index))}
        </tbody>
      </table>
    </div>
  );
}

export default SortableTable;