'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
    id?: string
    name?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    autoComplete?: string
    className?: string
    required?: boolean
    disabled?: boolean
}

export default function PasswordInput({
    id,
    name,
    value,
    onChange,
    placeholder = 'Password',
    autoComplete = 'current-password',
    className = '',
    required = false,
    disabled = false,
}: PasswordInputProps) {
    const [visible, setVisible] = useState(false)

    return (
        <div className="relative">
            <input
                id={id}
                name={name}
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required={required}
                disabled={disabled}
                className={`pr-11 ${className}`}
            />
            <button
                type="button"
                tabIndex={-1}
                onClick={() => setVisible(v => !v)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${visible ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
                    }`}
                aria-label={visible ? 'Hide password' : 'Show password'}
            >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    )
}
