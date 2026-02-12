'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Listbox, Transition } from '@headlessui/react';
import { cn } from '@/lib/utils';

type SelectTriggerProps = {
    children: React.ReactNode;
    className?: string;
};

type SelectValueProps = {
    placeholder?: string;
};

type SelectContentProps = {
    children: React.ReactNode;
    className?: string;
};

type SelectItemProps = {
    value: string;
    children: React.ReactNode;
    disabled?: boolean;
};

type SelectCtx = {
    value: string;
    leftIcon?: React.ReactNode;
    placeholder?: string;
    optionsMap: Map<string, React.ReactNode>;
};

const SelectContext = React.createContext<SelectCtx | null>(null);

function useSelectContext() {
    const ctx = React.useContext(SelectContext);
    if (!ctx) {
        throw new Error('Select components must be used within <Select>.');
    }
    return ctx;
}

function splitWidthClasses(className?: string) {
    const tokens = (className || '').split(/\s+/).filter(Boolean);
    const widthTokens: string[] = [];
    const restTokens: string[] = [];

    for (const token of tokens) {
        if (
            token.startsWith('w-') ||
            token.startsWith('min-w-') ||
            token.startsWith('max-w-')
        ) {
            widthTokens.push(token);
        } else {
            restTokens.push(token);
        }
    }

    return {
        widthClassName: widthTokens.join(' '),
        restClassName: restTokens.join(' '),
    };
}

function collectSelectItems(node: React.ReactNode) {
    const items: { value: string; label: React.ReactNode; disabled?: boolean }[] =
        [];

    const walk = (n: React.ReactNode) => {
        React.Children.forEach(n, (child) => {
            if (!React.isValidElement<{ children?: React.ReactNode }>(child))
                return;

            if (child.type === SelectItem) {
                const itemEl = child as React.ReactElement<SelectItemProps>;
                items.push({
                    value: itemEl.props.value,
                    label: itemEl.props.children,
                    disabled: itemEl.props.disabled,
                });
                return;
            }

            // Recurse into children (fragments, wrappers, etc.)
            if (child.props.children) walk(child.props.children);
        });
    };

    walk(node);
    return items;
}

function findChild<P>(
    children: React.ReactNode,
    component: React.ComponentType<P>,
) {
    return React.Children.toArray(children).find(
        (child) =>
            React.isValidElement<P>(child) && child.type === component,
    ) as React.ReactElement<P> | undefined;
}

function findPlaceholder(triggerChildren: React.ReactNode) {
    let placeholder: string | undefined;
    React.Children.forEach(triggerChildren, (child) => {
        if (!React.isValidElement<SelectValueProps>(child)) return;
        if (child.type === SelectValue) {
            placeholder = child.props.placeholder;
        }
    });
    return placeholder;
}

const Select = ({
    value,
    onValueChange,
    children,
    leftIcon,
    className,
}: {
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
    leftIcon?: React.ReactNode;
    className?: string;
}) => {
    const triggerEl = findChild<SelectTriggerProps>(children, SelectTrigger);
    const contentEl = findChild<SelectContentProps>(children, SelectContent);

    const placeholder = findPlaceholder(triggerEl?.props.children);
    const items = React.useMemo(
        () => collectSelectItems(contentEl?.props.children),
        [contentEl?.props.children],
    );
    const optionsMap = React.useMemo(
        () => new Map(items.map((i) => [i.value, i.label])),
        [items],
    );

    const triggerClassName = triggerEl?.props.className;
    const contentClassName = contentEl?.props.className;
    const { widthClassName, restClassName } = splitWidthClasses(triggerClassName);

    return (
        <SelectContext.Provider
            value={{
                value: value ?? '',
                leftIcon,
                placeholder,
                optionsMap,
            }}>
            <Listbox
                value={value ?? ''}
                onChange={(v: string) => onValueChange?.(v)}>
                <div className={cn('relative', widthClassName, className)}>
                    {leftIcon && (
                        <div className="absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 z-10">
                            {leftIcon}
                        </div>
                    )}

                    <Listbox.Button
                        className={cn(
                            'w-full h-11 px-4 pe-10 text-sm bg-white border border-gray-200 rounded-xl transition-all duration-200',
                            'focus:outline-none focus-visible:ring-4 focus-visible:ring-theme-primary/5 focus-visible:border-theme-primary-border',
                            'cursor-pointer hover:border-gray-300 text-start truncate',
                            leftIcon && 'ps-10',
                            restClassName,
                        )}>
                        <SelectValue />
                        <span className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </span>
                    </Listbox.Button>

                    <Transition
                        as={React.Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95">
                        <Listbox.Options
                            className={cn(
                                'absolute z-50 mt-2 w-full max-h-64 overflow-auto rounded-2xl bg-white border border-gray-200 shadow-xl ring-1 ring-black/5 p-2',
                                'focus:outline-none select-options-scroll',
                                contentClassName,
                            )}>
                            {items.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-gray-400">
                                    —
                                </div>
                            ) : (
                                contentEl?.props.children
                            )}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </SelectContext.Provider>
    );
};

/**
 * Marker components (Radix-like API).
 * `Select` parses them and renders a styled, accessible dropdown.
 */
const SelectTrigger: React.FC<SelectTriggerProps> = () => null;

const SelectValue = ({ placeholder }: SelectValueProps) => {
    const { value, placeholder: ctxPlaceholder, optionsMap } = useSelectContext();
    const label = optionsMap.get(value);
    const display = label ?? placeholder ?? ctxPlaceholder ?? '';

    return (
        <span className={cn(!label && 'text-gray-400')}>
            {display}
        </span>
    );
};

const SelectContent: React.FC<SelectContentProps> = () => null;

const SelectItem = ({
    value,
    children,
    disabled,
}: SelectItemProps) => (
    <Listbox.Option
        value={value}
        disabled={disabled}
        className={({ active, selected, disabled }) =>
            cn(
                'relative cursor-pointer select-none rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                disabled && 'opacity-50 cursor-not-allowed',
                active && 'bg-theme-primary/10 text-theme-primary',
                selected && 'bg-theme-primary/15 text-theme-primary',
                !active && !selected && 'text-gray-700 hover:bg-gray-50',
            )
        }>
        {({ selected }) => (
            <div className="flex items-center justify-between gap-3">
                <span className="truncate">{children}</span>
                {selected && (
                    <Check className="w-4 h-4 text-theme-primary shrink-0" />
                )}
            </div>
        )}
    </Listbox.Option>
);

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
