import React, { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
    size?: 'sm' | 'md';
}

export function Badge({
    children,
    variant = 'primary',
    size = 'sm',
    className = '',
    ...props
}: BadgeProps) {
    const baseStyles = 'inline-flex items-center justify-center font-bold rounded-full';

    const variants = {
        primary: 'bg-primary-light text-primary',
        success: 'bg-success-light text-success',
        warning: 'bg-warning-light text-warning',
        error: 'bg-error-light text-error',
        neutral: 'bg-gray-100 text-gray-700',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-3 py-1 text-[13px]',
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </span>
    );
}

// Specialized badge for numeric counts (e.g., cart items, notifications)
export function CountBadge({ count, className = '' }: { count: number, className?: string }) {
    if (count <= 0) return null;

    return (
        <span className={`absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white shadow-sm border-2 border-white ${className}`}>
            {count > 99 ? '99+' : count}
        </span>
    );
}
