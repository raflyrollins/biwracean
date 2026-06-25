import { Search } from 'lucide-react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder = 'Cari...' }: SearchInputProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onChange(e.currentTarget.value);
        }
    };

    return (
        <div className="relative">
            <input
                type="text"
                defaultValue={value}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="input h-9 w-56 pr-10 text-[13px]"
                style={{ paddingRight: '2rem' }}
                autoFocus
            />
            <Search className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-body-subtle" />
        </div>
    );
}
