interface TimePickerProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    error?: string;
}

export default function TimePicker({ value, onChange, label, error }: TimePickerProps) {
    return (
        <div>
            {label && <label className="input-label">{label}</label>}
            <input
                type="time"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="input w-32"
            />
            {error && <p className="mt-1 text-[12px] text-fg-danger">{error}</p>}
        </div>
    );
}
