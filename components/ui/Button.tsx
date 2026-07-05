import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
};

const base =
  'inline-flex items-center justify-center gap-2.5 rounded font-sans text-[15px] font-medium transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none px-5 py-3.5';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  // Ana CTA'lar için: ince altın çerçeve, dolgu değil — "loud" değil "quiet luxury"
  primary:
    'border border-gold text-ivory hover:bg-gold hover:text-void active:scale-[0.98]',
  secondary:
    'border border-hairline text-ivory hover:border-hairline-strong hover:bg-surface-raised active:scale-[0.98]',
  ghost: 'text-dust hover:text-ivory',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', fullWidth, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
