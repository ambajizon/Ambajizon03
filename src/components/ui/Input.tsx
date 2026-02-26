import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    success?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, success, iconLeft, iconRight, ...props }, ref) => {
        const baseStyles = 'flex h-12 w-full rounded-lg border bg-white px-4 py-2 text-[15px] transition-all duration-200 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50';

        let borderStyles = 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10';

        if (error) {
            borderStyles = 'border-error text-error focus:border-error focus:ring-4 focus:ring-error/10';
        } else if (success) {
            borderStyles = 'border-success text-success focus:border-success focus:ring-4 focus:ring-success/10';
        }

        const paddingLeft = iconLeft ? 'pl-11' : '';
        const paddingRight = iconRight ? 'pr-11' : '';

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="text-[13px] font-bold text-gray-700">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {iconLeft && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                            {iconLeft}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`${baseStyles} ${borderStyles} ${paddingLeft} ${paddingRight} ${className}`}
                        {...props}
                    />
                    {iconRight && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                            {iconRight}
                        </div>
                    )}
                </div>
                {error && <p className="text-[13px] text-error font-medium">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
