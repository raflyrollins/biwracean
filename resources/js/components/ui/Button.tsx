import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'brand' | 'white';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    children: ReactNode;
}

export default function Button({ variant = 'brand', className = '', children, ...props }: ButtonProps) {
    const variantClass = variant === 'white' ? 'btn-white' : 'btn-brand';

    return (
        <button className={`btn ${variantClass} ${className}`} {...props}>
            {children}
        </button>
    );
}
