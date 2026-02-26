import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

export function Card({
    children,
    padding = 'md',
    hover = false,
    className = '',
    ...props
}: CardProps) {
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const hoverStyle = hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-md' : '';

    return (
        <div
            className={`bg-white rounded-xl shadow-sm border border-gray-100 ${paddings[padding]} ${hoverStyle} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: HTMLAttributes<HTMLDivElement>) {
    return <div className={`mb-4 pb-4 border-b border-gray-100 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={`font-bold text-gray-900 text-lg ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }: HTMLAttributes<HTMLDivElement>) {
    return <div className={`space-y-4 ${className}`}>{children}</div>;
}
