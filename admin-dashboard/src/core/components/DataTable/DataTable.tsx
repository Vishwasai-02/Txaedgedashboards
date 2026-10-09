import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import './DataTable.css';

export interface DataTableColumn {
  header: React.ReactNode;
  key: string;
  render?: (row: any) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps {
  columns?: DataTableColumn[] | any[];
  data?: any[];
  searchPlaceholder?: string;
  searchField?: string | null;
  emptyMessage?: string;
  pageSize?: number;
  extraToolbar?: React.ReactNode;
  loading?: boolean;
  selectable?: boolean;
  selectedRows?: any[];
  onSelectionChange?: ((selected: any[]) => void) | null;
  idKey?: string;
}

export default function DataTable({
  columns = [],
  data = [],
  searchPlaceholder = 'Search records...',
  searchField = null,
  emptyMessage = 'No records found',
  pageSize: initialPageSize = 10,
  extraToolbar = null,
  loading = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange = null,
  idKey = 'id'
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null });

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) => {
      if (searchField && row[searchField] !== undefined && row[searchField] !== null) {
        return String(row[searchField]).toLowerCase().includes(term);
      }
      return Object.values(row).some((val) =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchField]);

  // Sorting
  const sortedData = useMemo(() => {
    const key = sortConfig.key;
    const direction = sortConfig.direction;
    if (!key || !direction) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const aVal = (a as any)[key];
      const bVal = (b as any)[key];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      if (strA < strB) return direction === 'asc' ? -1 : 1;
      if (strA > strB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (colKey: string) => {
    if (!colKey) return;
    setSortConfig((prev) => {
      if (prev.key !== colKey) {
        return { key: colKey, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key: colKey, direction: 'desc' };
      }
      return { key: null, direction: null };
    });
    setCurrentPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      onSelectionChange(paginatedData.map((r) => r[idKey] || r));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (rowId: any) => {
    if (!onSelectionChange) return;
    if (selectedRows.includes(rowId)) {
      onSelectionChange(selectedRows.filter((id) => id !== rowId));
    } else {
      onSelectionChange([...selectedRows, rowId]);
    }
  };

  return (
    <div className="tx-datatable-wrapper">
      <div className="tx-datatable-toolbar">
        <div className="tx-datatable-search">
          <Search size={16} color="var(--tx-muted-text)" />
          <input
            type="text"
            className="tx-datatable-search-input"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <button
              type="button"
              className="tx-datatable-clear-search"
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {extraToolbar && <div className="tx-datatable-actions">{extraToolbar}</div>}
      </div>

      <div className="tx-datatable-scroll">
        <table className="tx-table">
          <thead>
            <tr>
              {selectable && (
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((r) => selectedRows.includes(r[idKey]))
                    }
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((col, idx) => {
                const canSort = col.sortable !== false && !!col.key;
                const isSorted = sortConfig.key === col.key;
                return (
                  <th
                    key={col.key || idx}
                    className={canSort ? 'tx-th-sortable' : ''}
                    onClick={() => canSort && handleSort(col.key)}
                    style={{ cursor: canSort ? 'pointer' : 'default', userSelect: 'none' }}
                  >
                    <div className="tx-th-content">
                      <span>{col.header}</span>
                      {canSort && (
                        <span className="tx-sort-icon">
                          {isSorted && sortConfig.direction === 'asc' ? (
                            <ArrowUp size={13} className="tx-sort-active" />
                          ) : isSorted && sortConfig.direction === 'desc' ? (
                            <ArrowDown size={13} className="tx-sort-active" />
                          ) : (
                            <ArrowUpDown size={12} className="tx-sort-muted" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="tx-datatable-loading">
                  Loading records...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="tx-datatable-empty">
                  <div>
                    <p>{emptyMessage}</p>
                    {searchTerm && (
                      <button
                        type="button"
                        className="tx-btn-link-action"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear search filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => {
                const rowId = row[idKey] || rIdx;
                const isSelected = selectedRows.includes(rowId);
                return (
                  <tr key={rowId} className={isSelected ? 'tx-row-selected' : ''}>
                    {selectable && (
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                        />
                      </td>
                    )}
                    {columns.map((col, cIdx) => (
                      <td key={col.key || cIdx}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="tx-datatable-pagination">
        <div className="tx-pagination-info">
          <span>
            Showing {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </span>
          <div className="tx-pagesize-wrapper">
            <label htmlFor="tx-pagesize-select">Rows per page:</label>
            <select
              id="tx-pagesize-select"
              className="tx-pagesize-select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="tx-pagination-controls">
          <button
            type="button"
            className="tx-pagination-btn"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="tx-pagination-btn"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
