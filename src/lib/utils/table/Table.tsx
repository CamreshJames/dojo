import { createContext, useState, useEffect, useCallback, useContext, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';

const styles = `
.universal-table {
  --border-color: #ddd;
  --bg-color: #fff;
  --text-color: #333;
  --action-bg: #f0f0f0;
  --action-hover: #e0e0e0;
  --modal-bg: #fff;
  --modal-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-color);
  color: var(--text-color);
}

.table-loading {
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.table-error {
  padding: 1rem;
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
  margin: 1rem;
  border-radius: 4px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--action-bg);
  border-bottom: 1px solid var(--border-color);
}

.toolbar-actions-left,
.toolbar-actions-right {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.table-toolbar button,
.table-actions .action-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn svg {
  width: 20px;
  height: 20px;
}

.table-toolbar button:hover,
.table-actions .action-btn:hover {
  background: var(--action-hover);
}

.filter-btn-wrapper,
.sort-btn-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid var(--border-color);
    padding-left: 1rem;
    border-radius: 4px;
    background: var(--bg-color);
}

.filter-btn-wrapper .action-btn,
.sort-btn-wrapper .action-btn {
    border: none;
    padding-right: 1rem;
}

.badge {
  background: #007bff;
  color: white;
  border-radius: 10px;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  min-width: 1rem;
  text-align: center;
}

.clear-filters-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  line-height: 1;
  padding: 0 0.5rem 0 0;
  cursor: pointer;
  color: #dc3545;
  transition: color 0.2s;
}

.clear-filters-btn:hover {
  color: #a71d2a;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  background: var(--action-bg);
  font-weight: bold;
  cursor: pointer;
  user-select: none;
}

.sort-indicator {
  margin-left: 0.25rem;
  font-size: 0.75rem;
  vertical-align: middle;
}

tr {
  cursor: pointer;
  transition: background-color 0.2s;
}

tr:focus, th:focus {
  outline: 2px solid #007bff;
  outline-offset: -2px;
}

.table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--action-bg);
  border-top: 1px solid var(--border-color);
  gap: 1rem;
}

.pagination-info {
  color: #666;
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-pagination button {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    background: var(--bg-color);
    border-radius: 4px;
    cursor: pointer;
}

.table-pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-pagination select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-color);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: var(--modal-bg);
  border-radius: 8px;
  box-shadow: var(--modal-shadow);
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--action-bg);
}

.modal-head h3 {
  flex: 1;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: var(--action-hover);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-body select,
.modal-body input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.sort-item,
.filter-item {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  align-items: center;
}

.filter-item {
  grid-template-columns: 1fr 1fr 1.5fr auto;
  gap: 1rem;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background: #218838;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background-color: #fce8e6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  background: var(--action-bg);
}

.modal-footer button {
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.cancel-btn {
    background-color: var(--bg-color);
    color: var(--text-color);
}

.cancel-btn:hover {
    background-color: var(--action-hover);
}

.apply-btn {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.apply-btn:hover {
  background: #0056b3;
  border-color: #0056b3;
}
`;

export function AddIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 13H5V11H11V5H13V11H19V13H13V19H11V13Z" fill="white" />
        </svg>
    );
}

function SortIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3a1 1 0 000 2h14a1 1 0 100-2H3zM3 7a1 1 0 000 2h10a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
        </svg>
    );
}

function FilterIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" />
        </svg>
    );
}

function RefreshIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 0V1H0V3H1V16C1 16.5304 1.21071 17.0391 1.58579 17.4142C1.96086 17.7893 2.46957 18 3 18H13C13.5304 18 14.0391 17.7893 14.4142 17.4142C14.7893 17.0391 15 16.5304 15 16V3H16V1H11V0H5ZM3 3H13V16H3V3ZM5 5V14H7V5H5ZM9 5V14H11V5H9Z" fill="#A10900" />
        </svg>
    );
}

function CancelModalIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="red" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.00008 15.6667C5.32508 15.6667 2.33341 12.675 2.33341 9.00002C2.33341 5.32502 5.32508 2.33335 9.00008 2.33335C12.6751 2.33335 15.6667 5.32502 15.6667 9.00002C15.6667 12.675 12.6751 15.6667 9.00008 15.6667ZM9.00008 4.33335C6.42508 4.33335 4.33341 6.42502 4.33341 9.00002C4.33341 11.575 6.42508 13.6667 9.00008 13.6667C11.5751 13.6667 13.6667 11.575 13.6667 9.00002C13.6667 6.42502 11.5751 4.33335 9.00008 4.33335ZM11.8334 10.4167L10.4167 11.8334L9.00008 10.4167L7.58341 11.8334L6.16675 10.4167L7.58341 9.00002L6.16675 7.58335L7.58341 6.16669L9.00008 7.58335L10.4167 6.16669L11.8334 7.58335L10.4167 9.00002L11.8334 10.4167Z" />
        </svg>
    );
}

export interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    render?: (value: any, row: T) => ReactNode;
}

export interface RowProps<T> {
    className?: string;
    onClick?: (row: T) => void;
}

export interface Sort {
    column: string;
    direction: 'asc' | 'desc';
}

export interface Filter {
    column: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: string;
}

export interface TableOperations {
    onSort?: (sorts: Sort[]) => void;
    onFilter?: (filters: Filter[]) => void;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
}

export interface TableProps<T> {
    tableId: string;
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    error?: string | null;
    initialPageSize?: number;

    currentPage?: number;
    totalPages?: number;
    totalCount?: number;
    pageSize?: number;

    getRowProps?: (row: T) => RowProps<T>;
    onRefresh?: () => void;
    showToolbar?: boolean;
    showPagination?: boolean;
    className?: string;

    operations?: TableOperations;
}

interface TableContextValue {
    sorts: Sort[];
    setSorts: React.Dispatch<React.SetStateAction<Sort[]>>;
    filters: Filter[];
    setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    currentPageSize: number;
    setCurrentPageSize: React.Dispatch<React.SetStateAction<number>>;
}

const TableContext = createContext<TableContextValue | undefined>(undefined);

const useTableContext = () => {
    const context = useContext(TableContext);
    if (!context) {
        throw new Error('useTableContext must be used within TableProvider');
    }
    return context;
};

function TableProvider({
    children,
    initialPageSize = 10
}: {
    children: ReactNode;
    initialPageSize?: number;
}) {
    const [sorts, setSorts] = useState<Sort[]>([]);
    const [filters, setFilters] = useState<Filter[]>([]);
    const [pageIndex, setPageIndex] = useState<number>(0);
    const [currentPageSize, setCurrentPageSize] = useState<number>(initialPageSize);

    return (
        <TableContext.Provider
            value={{
                sorts,
                setSorts,
                filters,
                setFilters,
                pageIndex,
                setPageIndex,
                currentPageSize,
                setCurrentPageSize,
            }}
        >
            {children}
        </TableContext.Provider>
    );
}

function TableContent<T extends object>({
    data,
    columns,
    loading = false,
    error = null,
    currentPage = 0,
    totalPages = 1,
    totalCount = 0,
    pageSize = 10,
    getRowProps,
    onRefresh,
    showToolbar = true,
    showPagination = true,
    className = '',
    operations
}: Omit<TableProps<T>, 'initialPageSize' | 'tableId'>) {
    const {
        sorts,
        setSorts,
        filters,
        setFilters,
        pageIndex,
        setPageIndex,
        currentPageSize,
        setCurrentPageSize,
    } = useTableContext();

    const [sortModalOpen, setSortModalOpen] = useState(false);
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    const lastOperationCall = useRef<{
        sorts?: Sort[];
        filters?: Filter[];
        page?: number;
        pageSize?: number;
    }>({});

    useEffect(() => {
        if (currentPageSize !== pageSize) {
            setCurrentPageSize(pageSize);
        }
    }, [pageSize, currentPageSize, setCurrentPageSize]);

    useEffect(() => {
        if (pageIndex !== currentPage) {
            setPageIndex(currentPage);
        }
    }, [currentPage, pageIndex, setPageIndex]);

    useEffect(() => {
        if (!operations) return;

        const current = { sorts, filters, page: pageIndex, pageSize: currentPageSize };
        const last = lastOperationCall.current;

        if (JSON.stringify(current.sorts) !== JSON.stringify(last.sorts) && operations.onSort) {
            operations.onSort(sorts);
        }

        if (JSON.stringify(current.filters) !== JSON.stringify(last.filters) && operations.onFilter) {
            operations.onFilter(filters);
        }

        if (current.page !== last.page && operations.onPageChange) {
            operations.onPageChange(pageIndex);
        }

        if (current.pageSize !== last.pageSize && operations.onPageSizeChange) {
            operations.onPageSizeChange(currentPageSize);
        }

        lastOperationCall.current = current;
    }, [sorts, filters, pageIndex, currentPageSize, operations]);

    const handleColumnSort = useCallback((columnKey: string) => {
        setSorts(prev => {
            const existingIndex = prev.findIndex(s => s.column === columnKey);

            if (existingIndex >= 0) {
                const existing = prev[existingIndex];
                if (existing.direction === 'asc') {
                    return prev.map((s, i) =>
                        i === existingIndex ? { ...s, direction: 'desc' } : s
                    );
                } else {
                    return prev.filter((_, i) => i !== existingIndex);
                }
            } else {
                return [...prev, { column: columnKey, direction: 'asc' }];
            }
        });
    }, [setSorts]);

    const getSortIndicator = useCallback((columnKey: string) => {
        const sort = sorts.find(s => s.column === columnKey);
        return sort ? (sort.direction === 'asc' ? '↑' : '↓') : '';
    }, [sorts]);

    const processedData = useMemo(() => {
        if (operations) return data;

        let result = [...data];

        if (filters.length > 0) {
            result = result.filter(row => {
                return filters.every(({ column, operator, value }) => {
                    const cellValue = String(row[column as keyof T]).toLowerCase();
                    const filterValue = value.toLowerCase();

                    switch (operator) {
                        case 'equals':
                            return cellValue === filterValue;
                        case 'contains':
                            return cellValue.includes(filterValue);
                        case 'greater_than':
                            return Number(cellValue) > Number(filterValue);
                        case 'less_than':
                            return Number(cellValue) < Number(filterValue);
                        default:
                            return true;
                    }
                });
            });
        }

        if (sorts.length > 0) {
            result.sort((a, b) => {
                for (const { column, direction } of sorts) {
                    const valA = a[column as keyof T];
                    const valB = b[column as keyof T];
                    if (valA < valB) return direction === 'asc' ? -1 : 1;
                    if (valA > valB) return direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        const startIndex = pageIndex * currentPageSize;
        return result.slice(startIndex, startIndex + currentPageSize);
    }, [data, filters, sorts, pageIndex, currentPageSize, operations]);

    const paginationInfo = useMemo(() => {
        if (operations) {
            return {
                totalPages,
                totalCount,
                currentPage: pageIndex,
                startRecord: pageIndex * currentPageSize + 1,
                endRecord: Math.min((pageIndex + 1) * currentPageSize, totalCount)
            };
        }

        let filteredCount = data.length;
        if (filters.length > 0) {
            filteredCount = data.filter(row => {
                return filters.every(({ column, operator, value }) => {
                    const cellValue = String(row[column as keyof T]).toLowerCase();
                    const filterValue = value.toLowerCase();
                    switch (operator) {
                        case 'equals': return cellValue === filterValue;
                        case 'contains': return cellValue.includes(filterValue);
                        case 'greater_than': return Number(cellValue) > Number(filterValue);
                        case 'less_than': return Number(cellValue) < Number(filterValue);
                        default: return true;
                    }
                });
            }).length;
        }

        const clientTotalPages = Math.max(1, Math.ceil(filteredCount / currentPageSize));
        return {
            totalPages: clientTotalPages,
            totalCount: filteredCount,
            currentPage: pageIndex,
            startRecord: pageIndex * currentPageSize + 1,
            endRecord: Math.min((pageIndex + 1) * currentPageSize, filteredCount)
        };
    }, [data, filters, pageIndex, currentPageSize, operations, totalPages, totalCount]);

    const clearFilters = useCallback(() => {
        setFilters([]);
        setPageIndex(0);
    }, [setFilters, setPageIndex]);

    const clearSorts = useCallback(() => {
        setSorts([]);
    }, [setSorts]);

    const handlePageChange = useCallback((newPage: number) => {
        setPageIndex(newPage);
    }, [setPageIndex]);

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setCurrentPageSize(newPageSize);
        setPageIndex(0);
    }, [setCurrentPageSize, setPageIndex]);

    return (
        <>
            <style>{styles}</style>
            <div className={`universal-table ${className} ${loading ? 'table-loading' : ''}`}>
                {loading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                    </div>
                )}

                {error && (
                    <div className="table-error">
                        Error: {error}
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem' }}
                            >
                                Retry
                            </button>
                        )}
                    </div>
                )}

                {showToolbar && (
                    <div className="table-toolbar">
                        <div className="toolbar-actions-left">
                            {onRefresh && (
                                <button className="action-btn" onClick={onRefresh} disabled={loading}>
                                    <RefreshIcon />
                                    Refresh
                                </button>
                            )}
                        </div>
                        <div className="toolbar-actions-right">
                            <div className="filter-btn-wrapper">
                                <button className="action-btn" onClick={() => setFilterModalOpen(true)}>
                                    <FilterIcon />
                                    Filter
                                </button>
                                {filters.length > 0 && (
                                    <>
                                        <span className="badge">{filters.length}</span>
                                        <button className="clear-filters-btn" onClick={clearFilters}>
                                            <CancelModalIcon />
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="sort-btn-wrapper">
                                <button className="action-btn" onClick={() => setSortModalOpen(true)}>
                                    <SortIcon />
                                    Sort
                                </button>
                                {sorts.length > 0 && (
                                    <>
                                        <span className="badge">{sorts.length}</span>
                                        <button className="clear-filters-btn" onClick={clearSorts}>
                                            <CancelModalIcon />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th
                                        key={String(col.key)}
                                        onClick={col.sortable ? () => handleColumnSort(String(col.key)) : undefined}
                                        style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                                    >
                                        {col.label}
                                        {col.sortable && (
                                            <span className="sort-indicator">
                                                {getSortIndicator(String(col.key))}
                                            </span>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {processedData.map((row, idx) => {
                                const { className: rowClassName = '', onClick } = getRowProps ? getRowProps(row) : {};
                                return (
                                    <tr key={idx} className={rowClassName} onClick={() => onClick?.(row)}>
                                        {columns.map(col => (
                                            <td key={String(col.key)}>
                                                {col.render
                                                    ? col.render(row[col.key as keyof T], row)
                                                    : String(row[col.key as keyof T] ?? '')
                                                }
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {showPagination && (
                    <div className="table-pagination">
                        <div className="pagination-info">
                            Showing {paginationInfo.startRecord}-{paginationInfo.endRecord} of {paginationInfo.totalCount} records
                        </div>
                        <div className="pagination-controls">
                            <button
                                onClick={() => handlePageChange(0)}
                                disabled={paginationInfo.currentPage === 0 || loading}
                            >
                                First
                            </button>
                            <button
                                onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                                disabled={paginationInfo.currentPage === 0 || loading}
                            >
                                Prev
                            </button>
                            <span>
                                Page {paginationInfo.currentPage + 1} of {paginationInfo.totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                                disabled={paginationInfo.currentPage >= paginationInfo.totalPages - 1 || loading}
                            >
                                Next
                            </button>
                            <button
                                onClick={() => handlePageChange(paginationInfo.totalPages - 1)}
                                disabled={paginationInfo.currentPage >= paginationInfo.totalPages - 1 || loading}
                            >
                                Last
                            </button>
                        </div>
                        <select
                            value={currentPageSize}
                            onChange={e => handlePageSizeChange(Number(e.target.value))}
                            disabled={loading}
                        >
                            {[10, 20, 50, 100].map(ps => (
                                <option key={ps} value={ps}>Show {ps}</option>
                            ))}
                        </select>
                    </div>
                )}

                <SortModal
                    isOpen={sortModalOpen}
                    onClose={() => setSortModalOpen(false)}
                    columns={columns}
                />
                <FilterModal
                    isOpen={filterModalOpen}
                    onClose={() => setFilterModalOpen(false)}
                    columns={columns}
                />
            </div>
        </>
    );
}

function SortModal<T>({
    isOpen,
    onClose,
    columns
}: {
    isOpen: boolean;
    onClose: () => void;
    columns: Column<T>[];
}) {
    const { sorts, setSorts } = useTableContext();

    const addSort = useCallback(() => {
        setSorts(prev => [...prev, { column: '', direction: 'asc' }]);
    }, [setSorts]);

    const updateSort = useCallback((index: number, field: 'column' | 'direction', value: string) => {
        setSorts(prev => prev.map((s, i) =>
            i === index ? { ...s, [field]: value } : s
        ));
    }, [setSorts]);

    const removeSort = useCallback((index: number) => {
        setSorts(prev => prev.filter((_, i) => i !== index));
    }, [setSorts]);

    const applySorts = useCallback(() => {
        onClose();
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-head">
                    <h3>Sort By</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {sorts.map((sort, index) => (
                        <div key={index} className="sort-item">
                            <select
                                value={sort.column}
                                onChange={e => updateSort(index, 'column', e.target.value)}
                            >
                                <option value="">Select Column</option>
                                {columns
                                    .filter(c => c.sortable)
                                    .map(c => (
                                        <option key={String(c.key)} value={String(c.key)}>
                                            {c.label}
                                        </option>
                                    ))
                                }
                            </select>
                            <select
                                value={sort.direction}
                                onChange={e => updateSort(index, 'direction', e.target.value)}
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                            <button className="delete-btn" onClick={() => removeSort(index)}>
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                    <button className="add-btn" onClick={addSort}>
                        <AddIcon />
                        Add Sort
                    </button>
                </div>
                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="apply-btn" onClick={applySorts}>Apply</button>
                </div>
            </div>
        </div>
    );
}

function FilterModal<T>({
    isOpen,
    onClose,
    columns
}: {
    isOpen: boolean;
    onClose: () => void;
    columns: Column<T>[];
}) {
    const { filters, setFilters } = useTableContext();

    const addFilter = useCallback(() => {
        setFilters(prev => [...prev, { column: '', operator: 'equals', value: '' }]);
    }, [setFilters]);

    const updateFilter = useCallback((index: number, field: 'column' | 'operator' | 'value', value: string) => {
        setFilters(prev => prev.map((f, i) =>
            i === index ? { ...f, [field]: value } : f
        ));
    }, [setFilters]);

    const removeFilter = useCallback((index: number) => {
        setFilters(prev => prev.filter((_, i) => i !== index));
    }, [setFilters]);

    const applyFilters = useCallback(() => {
        onClose();
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-head">
                    <h3>Filters</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {filters.map((filter, index) => (
                        <div key={index} className="filter-item">
                            <select
                                value={filter.column}
                                onChange={e => updateFilter(index, 'column', e.target.value)}
                            >
                                <option value="">Select Column</option>
                                {columns
                                    .filter(c => c.filterable)
                                    .map(c => (
                                        <option key={String(c.key)} value={String(c.key)}>
                                            {c.label}
                                        </option>
                                    ))
                                }
                            </select>
                            <select
                                value={filter.operator}
                                onChange={e => updateFilter(index, 'operator', e.target.value)}
                            >
                                <option value="equals">Equals</option>
                                <option value="contains">Contains</option>
                                <option value="greater_than">Greater Than</option>
                                <option value="less_than">Less Than</option>
                            </select>
                            <input
                                type="text"
                                value={filter.value}
                                onChange={e => updateFilter(index, 'value', e.target.value)}
                                placeholder="Value"
                            />
                            <button className="delete-btn" onClick={() => removeFilter(index)}>
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                    <button className="add-btn" onClick={addFilter}>
                        <AddIcon />
                        Add Filter
                    </button>
                </div>
                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="apply-btn" onClick={applyFilters}>Apply</button>
                </div>
            </div>
        </div>
    );
}

export function Table<T extends object>({
    // tableId,
    data,
    columns,
    loading = false,
    error = null,
    initialPageSize = 10,
    currentPage = 0,
    totalPages = 1,
    totalCount = 0,
    pageSize = 10,
    getRowProps,
    onRefresh,
    showToolbar = true,
    showPagination = true,
    className = '',
    operations
}: TableProps<T>) {
    return (
        <TableProvider initialPageSize={initialPageSize}>
            <TableContent
                data={data}
                columns={columns}
                loading={loading}
                error={error}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                getRowProps={getRowProps}
                onRefresh={onRefresh}
                showToolbar={showToolbar}
                showPagination={showPagination}
                className={className}
                operations={operations}
            />
        </TableProvider>
    );
}

interface DataFetcherParams {
    page: number;
    pageSize: number;
    sorts: Sort[];
    filters: Filter[];
}

interface DataFetcherResponse<T> {
    records: T[];
    total_count: number;
    last_page: number;
}

interface UseTableDataOptions<T> {
    fetcher: (params: DataFetcherParams) => Promise<DataFetcherResponse<T>>;
    initialPageSize?: number;
    enabled?: boolean;
}

interface UseTableDataReturn<T> {
    data: T[];
    loading: boolean;
    error: string | null;
    pageCount: number;
    totalCount: number;
    currentPage: number;
    refresh: () => void;
    setSorts: (sorts: Sort[]) => void;
    setFilters: (filters: Filter[]) => void;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    operations: TableOperations;
}

export function useTableData<T>({
    fetcher,
    initialPageSize = 10,
    enabled = true
}: UseTableDataOptions<T>): UseTableDataReturn<T> {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pageCount, setPageCount] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [params, setParams] = useState<DataFetcherParams>({
        page: 0,
        pageSize: initialPageSize,
        sorts: [],
        filters: [],
    });

    const stableFetcher = useRef(fetcher);
    stableFetcher.current = fetcher;

    const fetchData = useCallback(async (fetchParams: DataFetcherParams) => {
        if (!enabled) return;

        setLoading(true);
        setError(null);

        try {
            const response = await stableFetcher.current(fetchParams);
            setData(response.records);
            setPageCount(response.last_page);
            setTotalCount(response.total_count);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
            setError(errorMessage);
            setData([]);
            setPageCount(1);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        if (!enabled) return;

        const timeoutId = setTimeout(() => {
            fetchData(params);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [params, fetchData, enabled]);

    const operations: TableOperations = useMemo(() => ({
        onSort: (sorts: Sort[]) => {
            setParams(prev => ({ ...prev, sorts, page: 0 }));
        },
        onFilter: (filters: Filter[]) => {
            setParams(prev => ({ ...prev, filters, page: 0 }));
        },
        onPageChange: (page: number) => {
            setParams(prev => ({ ...prev, page }));
        },
        onPageSizeChange: (pageSize: number) => {
            setParams(prev => ({ ...prev, pageSize, page: 0 }));
        },
    }), []);

    const setSorts = useCallback((sorts: Sort[]) => {
        setParams(prev => ({ ...prev, sorts, page: 0 }));
    }, []);

    const setFilters = useCallback((filters: Filter[]) => {
        setParams(prev => ({ ...prev, filters, page: 0 }));
    }, []);

    const setPage = useCallback((page: number) => {
        setParams(prev => ({ ...prev, page }));
    }, []);

    const setPageSize = useCallback((pageSize: number) => {
        setParams(prev => ({ ...prev, pageSize, page: 0 }));
    }, []);

    const refresh = useCallback(() => {
        fetchData(params);
    }, [fetchData, params]);

    return {
        data,
        loading,
        error,
        pageCount,
        totalCount,
        currentPage: params.page,
        refresh,
        setSorts,
        setFilters,
        setPage,
        setPageSize,
        operations,
    };
}

function Demo() {
    const sampleData = [
        { id: 1, name: 'John Doe', age: 30, email: 'john@example.com', status: 'Active' },
        { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com', status: 'Inactive' },
        { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com', status: 'Active' },
        { id: 4, name: 'Alice Brown', age: 28, email: 'alice@example.com', status: 'Pending' },
        { id: 5, name: 'Charlie Wilson', age: 42, email: 'charlie@example.com', status: 'Active' },
        { id: 6, name: 'Diana Prince', age: 31, email: 'diana@example.com', status: 'Active' },
        { id: 7, name: 'Edward Clark', age: 29, email: 'edward@example.com', status: 'Inactive' },
        { id: 8, name: 'Fiona Davis', age: 33, email: 'fiona@example.com', status: 'Pending' },
        { id: 9, name: 'George Miller', age: 27, email: 'george@example.com', status: 'Active' },
        { id: 10, name: 'Helen White', age: 36, email: 'helen@example.com', status: 'Inactive' },
        { id: 11, name: 'Ian Thompson', age: 24, email: 'ian@example.com', status: 'Active' },
        { id: 12, name: 'Julia Garcia', age: 38, email: 'julia@example.com', status: 'Pending' },
    ];

    const columns = [
        { key: 'id', label: 'ID', sortable: true, filterable: true },
        { key: 'name', label: 'Name', sortable: true, filterable: true },
        { key: 'age', label: 'Age', sortable: true, filterable: true },
        { key: 'email', label: 'Email', sortable: true, filterable: true },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            filterable: true,
            render: (value: string) => (
                <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    backgroundColor: value === 'Active' ? '#d4edda' : value === 'Pending' ? '#fff3cd' : '#f8d7da',
                    color: value === 'Active' ? '#155724' : value === 'Pending' ? '#856404' : '#721c24'
                }}>
                    {value}
                </span>
            )
        },
    ];

    const handleRefresh = () => {
        console.log('Refreshing data...');
    };

    const getRowProps = (row: any) => ({
        onClick: (row: any) => console.log('Clicked row:', row),
        className: row.status === 'Inactive' ? 'inactive-row' : ''
    });

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Table Component Demo</h1>
            <Table
                tableId="demo-table"
                data={sampleData}
                columns={columns}
                onRefresh={handleRefresh}
                getRowProps={getRowProps}
                initialPageSize={5}
            />
        </div>
    );
}

export default Demo;