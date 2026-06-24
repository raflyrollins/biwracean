import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: ReactNode;
    endIcon?: ReactNode;
    error?: string;
}

export default function Input({
    label,
    icon,
    endIcon,
    error,
    id,
    className = '',
    ...props
}: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div>
            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body">
                        {icon}
                    </span>
                )}
                <input
                    id={inputId}
                    className={`input ${icon ? '!pl-10' : ''} ${endIcon ? '!pr-10' : ''} ${className}`}
                    {...props}
                />
                {endIcon && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-body">
                        {endIcon}
                    </span>
                )}
            </div>
            {error && (
                <p className="mt-1 text-[12px] text-fg-danger">{error}</p>
            )}
        </div>
    );
}
