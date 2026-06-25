import type { InputHTMLAttributes } from 'react';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    label?: string;
    error?: string;
    value: string | number;
    onChange: (value: string) => void;
}

export default function NumberInput({
    label,
    error,
    value,
    onChange,
    id,
    className = '',
    ...props
}: NumberInputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div>
            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                type="text"
                inputMode="numeric"
                value={value}
                onChange={(e) => {
                    const raw = e.target.value;
                    onChange(raw);
                }}
                onInput={(e) => {
                    const input = e.currentTarget;
                    input.value = input.value.replace(/[^0-9]/g, '');
                }}
                className={`input ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-[12px] text-fg-danger">{error}</p>
            )}
        </div>
    );
}
