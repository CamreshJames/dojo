import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import type { ReactNode } from 'react';
import './Table.css';

// Icons
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

// Types
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

export interface TableProps<T> {
    tableId: string;
    data?: T[];
    dataFetcher?: (params: {
        page: number;
        pageSize: number;
        sorts: Sort[];
        filters: Filter[];
    }) => Promise<{
        records: T[];
        total_count: number;
        last_page: number;
    }>;
    columns: Column<T>[];
    getRowProps?: (row: T) => RowProps<T>;
    onRefresh?: () => void;
    pageSize?: number;
    showToolbar?: boolean;
    showPagination?: boolean;
    className?: string;
}

interface Sort {
    column: string;
    direction: 'asc' | 'desc';
}

interface Filter {
    column: string;
    operator: 'equals' | 'contains' | 'greater than' | 'less than';
    value: string;
}

interface TableState {
    sorts: Sort[];
    filters: Filter[];
    pageIndex: number;
    pageCount: number;
    currentPageSize: number;
}

// Context for table state
const TableContext = createContext<{
    sorts: Sort[];
    setSorts: React.Dispatch<React.SetStateAction<Sort[]>>;
    filters: Filter[];
    setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    pageCount: number;
    setPageCount: React.Dispatch<React.SetStateAction<number>>;
    currentPageSize: number;
    setCurrentPageSize: React.Dispatch<React.SetStateAction<number>>;
} | undefined>(undefined);

const useTableContext = () => {
    const context = useContext(TableContext);
    if (!context) {
        console.error(
            'useTableContext must be used within TableProvider. Ensure the Table component is wrapped with TableProvider for tableId.'
        );
        console.trace(); // Log stack trace for debugging
        throw new Error('useTableContext must be used within TableProvider');
    }
    return context;
};

// Provider for table state with persistence
function TableProvider({ tableId, children }: { tableId: string; children: ReactNode }) {
    const storageKey = `${tableId}-table-state`;

    const loadState = (): TableState => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                // Invalid JSON, reset
            }
        }
        return {
            sorts: [],
            filters: [],
            pageIndex: 0,
            pageCount: 1,
            currentPageSize: 10,
        };
    };

    const [sorts, setSorts] = useState<Sort[]>(loadState().sorts);
    const [filters, setFilters] = useState<Filter[]>(loadState().filters);
    const [pageIndex, setPageIndex] = useState<number>(loadState().pageIndex);
    const [pageCount, setPageCount] = useState<number>(loadState().pageCount);
    const [currentPageSize, setCurrentPageSize] = useState<number>(loadState().currentPageSize);

    useEffect(() => {
        localStorage.setItem(
            storageKey,
            JSON.stringify({ sorts, filters, pageIndex, pageCount, currentPageSize })
        );
    }, [sorts, filters, pageIndex, pageCount, currentPageSize, storageKey]);

    return (
        <TableContext.Provider
            value={{
                sorts,
                setSorts,
                filters,
                setFilters,
                pageIndex,
                setPageIndex,
                pageCount,
                setPageCount,
                currentPageSize,
                setCurrentPageSize,
            }}
        >
            {children}
        </TableContext.Provider>
    );
}

// Main Table component
function Table<T extends object>({
    data: propData,
    dataFetcher,
    columns,
    getRowProps,
    onRefresh,
    pageSize = 10,
    showToolbar = true,
    showPagination = true,
    className = '',
}: TableProps<T>) {
    try {
        const {
            sorts,
            setSorts,
            filters,
            setFilters,
            pageIndex,
            setPageIndex,
            pageCount,
            setPageCount,
            currentPageSize,
            setCurrentPageSize,
        } = useTableContext();

        const [internalData, setInternalData] = useState<T[]>([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [sortModalOpen, setSortModalOpen] = useState(false);
        const [filterModalOpen, setFilterModalOpen] = useState(false);

        const data = dataFetcher ? internalData : (propData || []);

        // Fetch data if dataFetcher is provided
        const fetchData = useCallback(async () => {
            if (!dataFetcher) return;

            setLoading(true);
            setError(null);
            try {
                const response = await dataFetcher({
                    page: pageIndex,
                    pageSize: currentPageSize,
                    sorts,
                    filters,
                });
                setInternalData(response.records);
                setPageCount(response.last_page);
            } catch (err) {
                setError('Failed to fetch data. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, [dataFetcher, pageIndex, currentPageSize, sorts, filters, setPageCount]);

        useEffect(() => {
            fetchData();
        }, [fetchData]);

        useEffect(() => {
            setCurrentPageSize(pageSize);
        }, [pageSize, setCurrentPageSize]);

        // Local sorting if no dataFetcher
        const sortedData = useCallback(() => {
            if (dataFetcher || sorts.length === 0) return data;

            return [...data].sort((a, b) => {
                for (const { column, direction } of sorts) {
                    const valA = a[column as keyof T];
                    const valB = b[column as keyof T];
                    if (valA < valB) return direction === 'asc' ? -1 : 1;
                    if (valA > valB) return direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }, [data, sorts, dataFetcher]);

        // Local filtering if no dataFetcher
        const filteredData = useCallback(() => {
            const dataToFilter = sortedData();
            if (dataFetcher || filters.length === 0) return dataToFilter;

            return dataToFilter.filter(row => {
                return filters.every(({ column, operator, value }) => {
                    const cellValue = String(row[column as keyof T]).toLowerCase();
                    const filterValue = value.toLowerCase();

                    switch (operator) {
                        case 'equals':
                            return cellValue === filterValue;
                        case 'contains':
                            return cellValue.includes(filterValue);
                        case 'greater than':
                            return Number(cellValue) > Number(filterValue);
                        case 'less than':
                            return Number(cellValue) < Number(filterValue);
                        default:
                            return true;
                    }
                });
            });
        }, [sortedData, filters, dataFetcher]);

        const paginatedData = filteredData().slice(
            pageIndex * currentPageSize,
            (pageIndex + 1) * currentPageSize
        );

        const handleRefresh = () => {
            if (onRefresh) onRefresh();
            if (dataFetcher) fetchData();
        };

        const clearFilters = () => setFilters([]);

        const clearSorts = () => setSorts([]);

        if (loading) {
            return <div className="universal-table">Loading...</div>;
        }

        if (error) {
            return <div className="universal-table">{error}</div>;
        }

        return (
            <div className={`universal-table ${className}`}>
                {showToolbar && (
                    <div className="table-toolbar">
                        <div className="toolbar-actions-left">
                            <button className="action-btn" onClick={handleRefresh}>
                                <RefreshIcon />
                                Refresh
                            </button>
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
                                            <CancelModalIcon/>
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
                                            <CancelModalIcon/>
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
                                    <th key={String(col.key)}>
                                        {col.label}
                                        {col.sortable && <span className="sort-icon"><SortIcon /></span>}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((row, idx) => {
                                const { className = '', onClick } = getRowProps ? getRowProps(row) : {};
                                return (
                                    <tr key={idx} className={className} onClick={() => onClick?.(row)}>
                                        {columns.map(col => (
                                            <td key={String(col.key)}>
                                                {col.render ? col.render(row[col.key as keyof T], row) : String(row[col.key as keyof T] ?? '')}
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
                        <span>Page <strong>{pageIndex + 1}</strong> of <strong>{pageCount || 1}</strong></span>
                        <div className="pagination-controls">
                            <button onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>First</button>
                            <button onClick={() => setPageIndex(p => Math.max(0, p - 1))} disabled={pageIndex === 0}>Prev</button>
                            <button onClick={() => setPageIndex(p => Math.min(pageCount - 1, p + 1))} disabled={pageIndex >= pageCount - 1}>Next</button>
                            <button onClick={() => setPageIndex(pageCount - 1)} disabled={pageIndex >= pageCount - 1}>Last</button>
                        </div>
                        <select value={currentPageSize} onChange={e => setCurrentPageSize(Number(e.target.value))}>
                            {[10, 20, 50, 100].map(ps => (<option key={ps} value={ps}>Show {ps}</option>))}
                        </select>
                    </div>
                )}
                <SortModal isOpen={sortModalOpen} onClose={() => setSortModalOpen(false)} columns={columns} />
                <FilterModal isOpen={filterModalOpen} onClose={() => setFilterModalOpen(false)} columns={columns} />
            </div>
        );
    } catch (error) {
        console.error('Table component error:', error);
        return (
            <div className="universal-table error">
                <p>Dojo Training Error: Unable to render table. Please ensure it is wrapped with TableProvider.</p>
            </div>
        );
    }
}

// Sort Modal
function SortModal<T>({ isOpen, onClose, columns }: { isOpen: boolean; onClose: () => void; columns: Column<T>[] }) {
    const { sorts, setSorts } = useTableContext();

    const addSort = () => setSorts(prev => [...prev, { column: '', direction: 'asc' }]);

    const updateSort = (index: number, field: 'column' | 'direction', value: string) => {
        setSorts(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    };

    const removeSort = (index: number) => setSorts(prev => prev.filter((_, i) => i !== index));

    const applySorts = () => onClose();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
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
                                {columns.filter(c => c.sortable).map(c => (
                                    <option key={String(c.key)} value={String(c.key)}>{c.label}</option>
                                ))}
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

// Filter Modal
function FilterModal<T>({ isOpen, onClose, columns }: { isOpen: boolean; onClose: () => void; columns: Column<T>[] }) {
    const { filters, setFilters } = useTableContext();

    const addFilter = () => setFilters(prev => [...prev, { column: '', operator: 'equals', value: '' }]);

    const updateFilter = (index: number, field: 'column' | 'operator' | 'value', value: string) => {
        setFilters(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
    };

    const removeFilter = (index: number) => setFilters(prev => prev.filter((_, i) => i !== index));

    const applyFilters = () => onClose();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
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
                                {columns.filter(c => c.filterable).map(c => (
                                    <option key={String(c.key)} value={String(c.key)}>{c.label}</option>
                                ))}
                            </select>
                            <select
                                value={filter.operator}
                                onChange={e => updateFilter(index, 'operator', e.target.value)}
                            >
                                <option value="equals">Equals</option>
                                <option value="contains">Contains</option>
                                <option value="greater than">Greater Than</option>
                                <option value="less than">Less Than</option>
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

export { Table, TableProvider };