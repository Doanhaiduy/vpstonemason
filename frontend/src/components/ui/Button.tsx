import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        adminPrimary:
          'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-indigo-500',
        adminSoft:
          'border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700 focus-visible:ring-indigo-400',
        adminChip:
          'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700 focus-visible:ring-indigo-400',
        adminChipActive:
          'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-indigo-500',
        adminDanger:
          'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-400',
        clientPrimary:
          'bg-stone-900 text-white hover:bg-stone-800 focus-visible:ring-stone-500',
        clientGold:
          'bg-gradient-to-r from-accent-gold to-accent-gold-dark text-white shadow-sm hover:from-accent-gold-dark hover:to-accent-gold-dark focus-visible:ring-accent-gold',
        clientOutline:
          'border-2 border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white focus-visible:ring-stone-500',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-5 text-sm',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'adminPrimary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
