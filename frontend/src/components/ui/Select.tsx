import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'admin' | 'client';
  size?: 'sm' | 'md';
  className?: string;
}

const triggerBase =
  'inline-flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border bg-white px-3 text-left outline-none transition-all focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50';

const triggerByVariant = {
  admin: 'border-slate-200 text-slate-700 focus:border-indigo-400 focus:ring-indigo-100',
  client:
    'border-stone-300 bg-stone-50 text-stone-800 focus:border-accent-gold focus:ring-accent-gold/20',
} as const;

const triggerBySize = {
  sm: 'h-8 text-xs',
  md: 'h-10 text-sm',
} as const;

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  variant = 'admin',
  size = 'md',
  className,
}: SelectProps) {
  // Radix Select items cannot use empty-string values, so empty options are
  // treated as placeholder labels instead of rendered items.
  const normalizedOptions = options.filter((option) => option.value !== '');
  const emptyOption = options.find((option) => option.value === '');
  const resolvedPlaceholder =
    placeholder || emptyOption?.label || 'Select an option';

  return (
    <SelectPrimitive.Root
      value={value === '' ? undefined : value}
      onValueChange={onValueChange}
    >
      <SelectPrimitive.Trigger
        className={cn(
          triggerBase,
          triggerByVariant[variant],
          triggerBySize[size],
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={resolvedPlaceholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-[100] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <SelectPrimitive.Viewport className="p-1">
            {normalizedOptions.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="relative flex h-9 cursor-pointer select-none items-center rounded-lg py-1 pl-8 pr-3 text-sm text-slate-700 outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700"
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
