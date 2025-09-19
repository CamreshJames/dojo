import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import type { ReactNode } from 'react';
import './Table.css';

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
            <path d="M9.00008 15.6667C5.32508 15.6667 2.33341 12.675 2.33341 9.00002C2.33341 5.32502 5.32508 2.33335 9.00008 2.33335C12.6751 2.33335 15.6667 5.32502 15.6667 9.00002C15.6667 12.675 12.6751 15.6667 9.00008 15.6667ZM9.00008 0.666687C4.39175 0.666687 0.666748 4.39169 0.666748 9.00002C0.666748 13.6084 4.39175 17.3334 9.00008 17.3334C13.6084 17.3334 17.3334 13.6084 17.3334 9.00002C17.3334 4.39169 13.6084 0.666687 9.00008 0.666687ZM11.1584 5.66669L9.00008 7.82502L6.84175 5.66669L5.66675 6.84169L7.82508 9.00002L5.66675 11.1584L6.84175 12.3334L9.00008 10.175L11.1584 12.3334L12.3334 11.1584L10.1751 9.00002L12.3334 6.84169L11.1584 5.66669Z" fill="#FF3B30" />
        </svg>
    );
}

// --- TYPES --- //

export interface UniversalColumn<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    render?: (value: T[keyof T], row: T) => ReactNode;
}

export interface RowProps<T> {
    className?: string;
    onClick?: (row: T) => void;
}

export interface UniversalTableProps<T> {
    data: T[];
    columns: UniversalColumn<T>[];
    leftActions?: ReactNode;
    rightActions?: ReactNode;
    onRefresh?: () => void;
    getRowProps?: (row: T) => RowProps<T>;
    pageSize?: number;
    showToolbar?: boolean;
    showPagination?: boolean;
    className?: string;
    tableId: string;
}

type FilterType = 'contains' | 'equals' | 'startsWith';

interface TableContextValue<T> {
    sortState: { key: keyof T; desc: boolean }[];
    setSortState: (sort: { key: keyof T; desc: boolean }[]) => void;
    filterState: { key: keyof T; value: string; type: FilterType }[];
    setFilterState: (filters: { key: keyof T; value: string; type: FilterType }[]) => void;
}

// --- CONTEXT & PROVIDER --- //

const TableContext = createContext<TableContextValue<any> | null>(null);

export const TableProvider = <T extends object>({ children, tableId }: { children: ReactNode; tableId: string; }) => {
    const [sortState, setSortState] = useState<{ key: keyof T; desc: boolean }[]>([]);
    const [filterState, setFilterState] = useState<{ key: keyof T; value: string; type: FilterType }[]>([]);

    useEffect(() => {
        try {
            const savedSort = localStorage.getItem(`table-sort-${tableId}`);
            if (savedSort) setSortState(JSON.parse(savedSort));
            const savedFilters = localStorage.getItem(`table-filters-${tableId}`);
            if (savedFilters) setFilterState(JSON.parse(savedFilters));
        } catch (error) {
            console.error("Failed to parse table state from localStorage", error);
        }
    }, [tableId]);

    const debouncedSave = useCallback((key: string, value: any) => {
        const handler = setTimeout(() => localStorage.setItem(key, JSON.stringify(value)), 500);
        return () => clearTimeout(handler);
    }, []);

    useEffect(() => {
        debouncedSave(`table-sort-${tableId}`, sortState);
    }, [sortState, debouncedSave, tableId]);

    useEffect(() => {
        debouncedSave(`table-filters-${tableId}`, filterState);
    }, [filterState, debouncedSave, tableId]);

    const contextValue: TableContextValue<T> = { sortState, setSortState, filterState, setFilterState };
    return <TableContext.Provider value={contextValue}>{children}</TableContext.Provider>;
};

const useTableContext = <T extends object>() => {
    const context = useContext(TableContext);
    if (!context) throw new Error('useTableContext must be used within a TableProvider');
    return context as TableContextValue<T>;
};

// --- MODAL COMPONENTS --- //

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer: ReactNode;
    Icon: React.ComponentType<{ className?: string }>;
}

const Modal = ({ isOpen, onClose, title, children, footer, Icon }: ModalProps) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-head">
                    <Icon className="modal-icon" />
                    <h3>{title}</h3>
                    <button onClick={onClose} className="close-btn" aria-label="Close">
                        <CancelModalIcon />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                <div className="modal-footer">{footer}</div>
            </div>
        </div>
    );
};

const SortModal = <T extends object>({ isOpen, onClose, columns }: { isOpen: boolean; onClose: () => void; columns: UniversalColumn<T>[]; }) => {
    const { sortState, setSortState } = useTableContext<T>();
    const [localSorts, setLocalSorts] = useState(sortState.map(s => ({ key: String(s.key), desc: s.desc })));
    
    useEffect(() => {
      setLocalSorts(sortState.map(s => ({ key: String(s.key), desc: s.desc })));
    }, [isOpen, sortState]);

    const addSort = () => setLocalSorts([...localSorts, { key: '', desc: false }]);
    const removeSort = (index: number) => setLocalSorts(localSorts.filter((_, i) => i !== index));

    const updateSort = (index: number, field: 'key' | 'desc', value: string | boolean) => {
        setLocalSorts(localSorts.map((sort, i) => (i === index ? { ...sort, [field]: value } : sort)));
    };

    const handleApply = () => {
        const validSorts = localSorts.filter(s => s.key).map(s => ({ key: s.key as keyof T, desc: s.desc }));
        setSortState(validSorts);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Sort Table"
            Icon={SortIcon}
            footer={
                <>
                    <button onClick={onClose} className="cancel-btn">Cancel</button>
                    <button onClick={handleApply} className="apply-btn">Apply Sort</button>
                </>
            }
        >
            {localSorts.map((sort, index) => (
                <div key={index} className="sort-item">
                    <select value={sort.key} onChange={e => updateSort(index, 'key', e.target.value)}>
                        <option value="">Select Column...</option>
                        {columns.filter(c => c.sortable).map(col => (
                            <option key={String(col.key)} value={String(col.key)}>{col.label}</option>
                        ))}
                    </select>
                    <select value={sort.desc ? 'desc' : 'asc'} onChange={e => updateSort(index, 'desc', e.target.value === 'desc')}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                    <button className="delete-btn" onClick={() => removeSort(index)} aria-label="Delete sort criterion">
                        <TrashIcon />
                    </button>
                </div>
            ))}
            <button className="add-btn" onClick={addSort} aria-label="Add sort criterion">
                <AddIcon /> Add Sort Rule
            </button>
        </Modal>
    );
};

const FilterModal = <T extends object>({ isOpen, onClose, columns }: { isOpen: boolean; onClose: () => void; columns: UniversalColumn<T>[]; }) => {
    const { filterState, setFilterState } = useTableContext<T>();
    const [localFilters, setLocalFilters] = useState<{ key: string; value: string; type: FilterType }[]>(filterState.map(f => ({ ...f, key: String(f.key) })));
    
    useEffect(() => {
      setLocalFilters(filterState.map(f => ({ ...f, key: String(f.key) })));
    }, [isOpen, filterState]);

    const addFilter = () => setLocalFilters([...localFilters, { key: '', value: '', type: 'contains' }]);
    const removeFilter = (index: number) => setLocalFilters(localFilters.filter((_, i) => i !== index));

    const updateFilter = (index: number, field: 'key' | 'value' | 'type', value: string) => {
        setLocalFilters(localFilters.map((filter, i) => (i === index ? { ...filter, [field]: value } : filter)));
    };

    const handleApply = () => {
        const validFilters = localFilters.filter(f => f.key && f.value).map(f => ({ ...f, key: f.key as keyof T }));
        setFilterState(validFilters);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Filter Table"
            Icon={FilterIcon}
            footer={
                <>
                    <button onClick={onClose} className="cancel-btn">Cancel</button>
                    <button onClick={handleApply} className="apply-btn">Apply Filters</button>
                </>
            }
        >
            {localFilters.map((filter, index) => (
                <div key={index} className="filter-item">
                    <select value={filter.key} onChange={e => updateFilter(index, 'key', e.target.value)}>
                        <option value="">Select Column...</option>
                        {columns.filter(c => c.filterable).map(col => (
                            <option key={String(col.key)} value={String(col.key)}>{col.label}</option>
                        ))}
                    </select>
                    <select value={filter.type} onChange={e => updateFilter(index, 'type', e.target.value)}>
                        <option value="contains">Contains</option>
                        <option value="equals">Equals</option>
                        <option value="startsWith">Starts With</option>
                    </select>
                    <input type="text" value={filter.value} placeholder="Enter value..." onChange={e => updateFilter(index, 'value', e.target.value)} />
                    <button className="delete-btn" onClick={() => removeFilter(index)} aria-label="Delete filter criterion">
                        <TrashIcon />
                    </button>
                </div>
            ))}
            <button className="add-btn" onClick={addFilter} aria-label="Add filter criterion">
                <AddIcon /> Add Filter Rule
            </button>
        </Modal>
    );
};

// --- MAIN TABLE COMPONENT --- //

export const UniversalTable = <T extends object>({
    data,
    columns,
    leftActions,
    rightActions,
    onRefresh,
    getRowProps,
    pageSize = 10,
    showToolbar = true,
    showPagination = true,
    className = '',
}: UniversalTableProps<T>) => {
    const [sortModalOpen, setSortModalOpen] = useState(false);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [currentPageSize, setCurrentPageSize] = useState(pageSize);
    const [pageIndex, setPageIndex] = useState(0);
    const { sortState, setSortState, filterState, setFilterState } = useTableContext<T>();

    const processedData = useCallback(() => {
        let result = [...data];

        if (filterState.length > 0) {
            result = result.filter(row =>
                filterState.every(({ key, value, type }) => {
                    const rowValue = String(row[key] ?? '').toLowerCase();
                    const filterValue = value.toLowerCase();
                    if (type === 'contains') return rowValue.includes(filterValue);
                    if (type === 'equals') return rowValue === filterValue;
                    if (type === 'startsWith') return rowValue.startsWith(filterValue);
                    return true;
                })
            );
        }

        if (sortState.length > 0) {
            result.sort((a, b) => {
                for (const { key, desc } of sortState) {
                    const aVal = a[key];
                    const bVal = b[key];
                    if (aVal < bVal) return desc ? 1 : -1;
                    if (aVal > bVal) return desc ? -1 : 1;
                }
                return 0;
            });
        }

        return result;
    }, [data, sortState, filterState]);

    const finalData = processedData();
    const pageCount = Math.ceil(finalData.length / currentPageSize);
    const paginatedData = finalData.slice(pageIndex * currentPageSize, (pageIndex + 1) * currentPageSize);

    useEffect(() => {
        setPageIndex(0);
    }, [sortState, filterState, data, currentPageSize]);

    const clearFilters = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFilterState([]);
    };

    const clearSort = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSortState([]);
    };

    const Toolbar = () => (
        <div className="table-toolbar">
            <div className="toolbar-actions-left">
                {leftActions}
            </div>
            <div className="toolbar-actions-right">
                <div className="sort-btn-wrapper">
                    {sortState.length > 0 && <button className="clear-filters-btn" onClick={clearSort} aria-label="Clear all sorts"><CancelModalIcon/></button>}
                    <button onClick={() => setSortModalOpen(true)} aria-label="Sort" className="action-btn">
                        <SortIcon /> Sort
                        {sortState.length > 0 && <span className="badge">{sortState.length}</span>}
                    </button>
                </div>
                <div className="filter-btn-wrapper">
                    {filterState.length > 0 && <button className="clear-filters-btn" onClick={clearFilters} aria-label="Clear all filters"><CancelModalIcon/></button>}
                    <button onClick={() => setFilterModalOpen(true)} aria-label="Filter" className="action-btn">
                        <FilterIcon /> Filter
                        {filterState.length > 0 && <span className="badge">{filterState.length}</span>}
                    </button>
                </div>
                {onRefresh && (
                    <button onClick={onRefresh} aria-label="Refresh" className="action-btn">
                        <RefreshIcon />
                    </button>
                )}
                {rightActions}
            </div>
        </div>
    );

    return (
        <div className={`universal-table ${className}`}>
            {showToolbar && <Toolbar />}
            <div style={{ overflowX: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={String(col.key)}>
                                    {col.label}
                                    {col.sortable && (
                                        <span className="sort-icon">
                                            {sortState.find(s => s.key === col.key)?.desc ? '↓' : '↑'}
                                        </span>
                                    )}
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
                                            {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
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
                        <button onClick={() => setPageIndex(p => p - 1)} disabled={pageIndex === 0}>Prev</button>
                        <button onClick={() => setPageIndex(p => p + 1)} disabled={pageIndex >= pageCount - 1}>Next</button>
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
};

export const UniversalTableWithProvider = <T extends object>(props: UniversalTableProps<T>) => (
    <TableProvider<T> tableId={props.tableId}>
        <UniversalTable<T> {...props} />
    </TableProvider>
);