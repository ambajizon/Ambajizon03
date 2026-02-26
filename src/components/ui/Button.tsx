import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
}

export function Button({
    children,
    variant = 'primary',
    isLoading = false,
    fullWidth = false,
    className = '',
    disabled,
    icon,
    ...props
}: ButtonProps) {
    const baseStyles = "relative inline-flex items-center justify-center h-12 px-8 rounded-full font-bold text-[15px] transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg focus:ring-primary",
        secondary: "bg-white text-primary border-2 border-primary hover:bg-primary/5 focus:ring-primary",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200",
        danger: "bg-error text-white hover:bg-error/90 shadow-md hover:shadow-lg focus:ring-error",
        success: "bg-success text-white hover:bg-success/90 shadow-md hover:shadow-lg focus:ring-success",
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : icon ? (
                <span className="mr-2">{icon}</span>
            ) : null}
            {children}
        </button>
    );
}
