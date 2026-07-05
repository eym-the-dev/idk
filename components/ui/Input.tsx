import { InputHTMLAttributes, forwardRef } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`w-full rounded bg-surface border ${
            error ? 'border-rust' : 'border-hairline'
          } px-4 py-3.5 text-[15px] text-ivory placeholder:text-fog outline-none transition-colors focus:border-gold ${className}`}
          {...props}
        />
        {error && <p className="mt-2 text-[13px] text-rust">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
