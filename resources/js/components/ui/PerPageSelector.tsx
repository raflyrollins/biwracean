interface PerPageSelectorProps {
    value: number;
    onChange: (value: number) => void;
}

const OPTIONS = [10, 25, 50, 100];

export default function PerPageSelector({ value, onChange }: PerPageSelectorProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[13px] text-body-subtle">Tampil</span>
            <select
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="input h-9 w-16 text-[13px]"
            >
                {OPTIONS.map((n) => (
                    <option key={n} value={n}>
                        {n}
                    </option>
                ))}
            </select>
            <span className="text-[13px] text-body-subtle">per halaman</span>
        </div>
    );
}
