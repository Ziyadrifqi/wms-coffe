import { forwardRef, useState } from 'react';

import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react';

import { Eye, EyeOff } from 'lucide-react';

const baseFieldStyle =
  'w-full px-3.5 py-2.5 bg-latte/50 border border-espresso/12 rounded-lg text-sm text-espresso placeholder:text-espresso/30 focus:outline-none focus:ring-2 focus:ring-caramel/40 focus:border-caramel/40 transition';

interface FieldWrapperProps {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function FieldWrapper({ label, error, children }: FieldWrapperProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-espresso/55 mb-1.5 tracking-wide uppercase">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-clay text-xs mt-1">{error}</p>}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <FieldWrapper label={label} error={error}>
      <input ref={ref} className={`${baseFieldStyle} ${className}`} {...props} />
    </FieldWrapper>
  )
);
TextField.displayName = 'TextField';

// ===== Komponen baru: PasswordField dengan toggle show/hide =====
interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <FieldWrapper label={label} error={error}>
        <div className="relative">
          <input
            ref={ref}
            type={visible ? 'text' : 'password'}
            className={`${baseFieldStyle} pr-10 ${className}`}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso/30 hover:text-espresso/60 transition"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </FieldWrapper>
    );
  }
);
PasswordField.displayName = 'PasswordField';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, className = '', children, ...props }, ref) => (
    <FieldWrapper label={label} error={error}>
      <select ref={ref} className={`${baseFieldStyle} ${className}`} {...props}>
        {children}
      </select>
    </FieldWrapper>
  )
);
SelectField.displayName = 'SelectField';

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <FieldWrapper label={label} error={error}>
      <textarea ref={ref} className={`${baseFieldStyle} ${className}`} {...props} />
    </FieldWrapper>
  )
);
TextareaField.displayName = 'TextareaField';