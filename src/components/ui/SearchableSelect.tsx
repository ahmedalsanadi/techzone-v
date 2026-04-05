import React, {
    useState,
    useRef,
    useMemo,
    useCallback,
    useEffect,
    memo,
} from 'react';
import { ChevronDown, Check, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchableSelectOption {
    id: number;
    name: string;
}

export interface SearchableSelectProps {
    label: string;
    value: number | '';
    onChange: (value: number | '') => void;
    options: SearchableSelectOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    required?: boolean;
    disabled?: boolean;
    isLoading?: boolean;
    error?: string;
    className?: string;
    /** Optional: filter function. Default: case-insensitive name includes query */
    filterOption?: (option: SearchableSelectOption, query: string) => boolean;
}

const defaultFilter = (option: SearchableSelectOption, query: string) =>
    option.name.toLowerCase().includes(query.trim().toLowerCase());

export const SearchableSelect = memo(
    ({
        label,
        value,
        onChange,
        options,
        placeholder,
        searchPlaceholder = 'e.g. United Kingdom',
        required,
        disabled,
        isLoading,
        error,
        className,
        filterOption = defaultFilter,
    }: SearchableSelectProps) => {
        const [isOpen, setIsOpen] = useState(false);
        const [searchQuery, setSearchQuery] = useState('');
        const [highlightedIndex, setHighlightedIndex] = useState(0);
        const containerRef = useRef<HTMLDivElement>(null);
        const searchInputRef = useRef<HTMLInputElement>(null);
        const listRef = useRef<HTMLUListElement>(null);

        const selectedOption = useMemo(
            () =>
                value === ''
                    ? undefined
                    : options.find((o) => Number(o.id) === Number(value)),
            [options, value],
        );
        const displayLabel = selectedOption?.name ?? '';

        const filteredOptions = useMemo(() => {
            if (!searchQuery.trim()) return options;
            return options.filter((opt) => filterOption(opt, searchQuery));
        }, [options, searchQuery, filterOption]);

        const openDropdown = useCallback(() => {
            if (disabled || isLoading) return;
            setIsOpen(true);
            setSearchQuery('');
            setHighlightedIndex(0);
            requestAnimationFrame(() => searchInputRef.current?.focus());
        }, [disabled, isLoading]);

        const closeDropdown = useCallback(() => {
            setIsOpen(false);
            setSearchQuery('');
        }, []);

        const selectOption = useCallback(
            (option: SearchableSelectOption) => {
                onChange(option.id);
                closeDropdown();
            },
            [onChange, closeDropdown],
        );

        // Click outside
        useEffect(() => {
            if (!isOpen) return;
            const handleClickOutside = (e: MouseEvent) => {
                if (
                    containerRef.current &&
                    !containerRef.current.contains(e.target as Node)
                ) {
                    closeDropdown();
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () =>
                document.removeEventListener('mousedown', handleClickOutside);
        }, [isOpen, closeDropdown]);

        // Keyboard
        useEffect(() => {
            if (!isOpen) return;
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    closeDropdown();
                    return;
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightedIndex((i) =>
                        i < filteredOptions.length - 1 ? i + 1 : i,
                    );
                    return;
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightedIndex((i) => (i > 0 ? i - 1 : 0));
                    return;
                }
                if (e.key === 'Enter' && filteredOptions[highlightedIndex]) {
                    e.preventDefault();
                    selectOption(filteredOptions[highlightedIndex]);
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }, [
            isOpen,
            filteredOptions,
            highlightedIndex,
            selectOption,
            closeDropdown,
        ]);

        // Scroll highlighted into view
        useEffect(() => {
            if (!isOpen || !listRef.current) return;
            const el = listRef.current.children[
                highlightedIndex
            ] as HTMLElement;
            el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }, [isOpen, highlightedIndex]);

        return (
            <div className={cn('relative', className)} ref={containerRef}>
                <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wide md:tracking-wider mb-1 md:mb-1.5 ps-1">
                    {label} {required && '*'}
                </label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={openDropdown}
                        disabled={disabled}
                        className={cn(
                            'w-full flex items-center justify-between gap-1.5 md:gap-2 ps-3 pe-9 md:ps-4 md:pe-10 py-2 md:py-3 min-h-[44px] md:min-h-[48px] rounded-lg md:rounded-xl lg:rounded-2xl',
                            'bg-gray-50 border border-gray-200',
                            'focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all',
                            'font-semibold text-sm md:text-base text-start text-gray-900 leading-snug',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            isOpen &&
                                'border-theme-primary ring-2 ring-theme-primary/20',
                            error && 'border-red-500 ring-red-500/10',
                        )}
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                        aria-label={label}>
                        <span
                            className={cn(
                                'truncate',
                                !displayLabel && 'text-gray-500 font-medium',
                            )}>
                            {displayLabel || placeholder}
                        </span>
                        <span className="absolute end-3 md:end-4 top-1/2 -translate-y-1/2 flex items-center gap-0.5 md:gap-1 shrink-0 pointer-events-none">
                            {isLoading && (
                                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin text-theme-primary" />
                            )}
                            <ChevronDown
                                className={cn(
                                    'w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform duration-200',
                                    isOpen ? 'rotate-180' : 'rotate-0',
                                )}
                            />
                        </span>
                    </button>

                    {isOpen && (
                        <div
                            className="absolute z-50 w-full mt-1 py-1 rounded-lg md:rounded-xl lg:rounded-2xl bg-white border border-gray-200 shadow-lg"
                            role="listbox">
                            {/* Visible search input inside dropdown */}
                            <div className="p-2 border-b border-gray-100">
                                <div className="relative">
                                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setHighlightedIndex(0);
                                        }}
                                        placeholder={searchPlaceholder}
                                        className="w-full ps-9 pe-3 py-2.5 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:border-theme-primary focus:ring-1 focus:ring-theme-primary/20 outline-none"
                                        role="combobox"
                                        aria-autocomplete="list"
                                        aria-expanded="true"
                                        aria-controls="searchable-select-list"
                                        id="searchable-select-search"
                                    />
                                </div>
                            </div>

                            <ul
                                id="searchable-select-list"
                                ref={listRef}
                                className="max-h-[220px] overflow-y-auto py-1"
                                role="listbox">
                                {filteredOptions.length === 0 ? (
                                    <li className="px-4 py-3 text-sm text-gray-500">
                                        No results
                                    </li>
                                ) : (
                                    filteredOptions.map((opt, index) => {
                                        const isSelected =
                                            value !== '' &&
                                            Number(opt.id) === Number(value);
                                        const isHighlighted =
                                            index === highlightedIndex;
                                        return (
                                            <li
                                                key={opt.id}
                                                role="option"
                                                aria-selected={isSelected}
                                                className={cn(
                                                    'flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm transition-colors',
                                                    isSelected &&
                                                        'bg-theme-primary/10 text-theme-primary font-semibold',
                                                    isHighlighted &&
                                                        !isSelected &&
                                                        'bg-gray-100',
                                                    !isHighlighted &&
                                                        !isSelected &&
                                                        'hover:bg-gray-50',
                                                )}
                                                onMouseEnter={() =>
                                                    setHighlightedIndex(index)
                                                }
                                                onClick={() =>
                                                    selectOption(opt)
                                                }>
                                                {isSelected ? (
                                                    <Check className="w-4 h-4 shrink-0 text-theme-primary" />
                                                ) : (
                                                    <span className="w-4 shrink-0" />
                                                )}
                                                <span className="truncate">
                                                    {opt.name}
                                                </span>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        </div>
                    )}
                </div>
                {error && (
                    <span className="text-[10px] md:text-xs text-red-500 font-medium ps-1 mt-0.5 md:mt-1 block text-start leading-tight">
                        {error}
                    </span>
                )}
            </div>
        );
    },
);

SearchableSelect.displayName = 'SearchableSelect';
