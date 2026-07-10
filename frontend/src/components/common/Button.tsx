import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
  children: ReactNode;
}

const variantStyles = {
  primary: 'bg-roast text-latte hover:bg-espresso active:scale-[0.98] shadow-sm',
  secondary: 'border border-espresso/15 text-espresso hover:bg-espresso/5 active:scale-[0.98]',
  danger: 'bg-clay text-white hover:bg-clay/90 active:scale-[0.98] shadow-sm',
  ghost: 'text-espresso/60 hover:bg-espresso/5 hover:text-espresso',
};

export default function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
        disabled:opacity-50 disabled:pointer-events-none
        ${fullWidth ? 'w-full' : ''}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}