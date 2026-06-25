import { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    error?: string;
    min?: string;
}

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function formatDate(year: number, month: number, day: number): string {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
}

function parseDate(str: string): Date | null {
    if (!str) return null;
    const d = new Date(str + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
}

export default function DatePicker({ value, onChange, label, error, min }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
        const d = parseDate(value) || new Date();
        return { year: d.getFullYear(), month: d.getMonth() };
    });
    const inputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const minDate = useMemo(() => (min ? parseDate(min) : null), [min]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node) &&
                inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.year, viewDate.month, 1).getDay();

    const selected = useMemo(() => parseDate(value), [value]);

    const prevMonth = () => {
        setViewDate((v) => {
            if (v.month === 0) return { year: v.year - 1, month: 11 };
            return { year: v.year, month: v.month - 1 };
        });
    };

    const nextMonth = () => {
        setViewDate((v) => {
            if (v.month === 11) return { year: v.year + 1, month: 0 };
            return { year: v.year, month: v.month + 1 };
        });
    };

    const handleSelect = (day: number) => {
        const newVal = formatDate(viewDate.year, viewDate.month, day);
        onChange(newVal);
        setOpen(false);
    };

    const isDisabled = (day: number) => {
        if (!minDate) return false;
        const d = new Date(viewDate.year, viewDate.month, day);
        return d < minDate;
    };

    const displayValue = value
        ? new Date(value + 'T00:00:00').toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric',
          })
        : '';

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === viewDate.year && today.getMonth() === viewDate.month;

    return (
        <div>
            {label && <label className="input-label">{label}</label>}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    readOnly
                    value={displayValue}
                    placeholder="Pilih tanggal"
                    onClick={() => setOpen(!open)}
                    className="input cursor-pointer pr-10"
                />
                <Calendar
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body"
                />
            </div>
            {error && <p className="mt-1 text-[12px] text-fg-danger">{error}</p>}

            {open && (
                <div
                    ref={panelRef}
                    className="card absolute z-50 mt-1 w-72 animate-slide-down p-4 shadow-lg"
                >
                    <div className="mb-3 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="rounded p-1 text-body hover:bg-neutral-tertiary hover:text-heading"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-[14px] font-semibold text-heading">
                            {MONTHS[viewDate.month]} {viewDate.year}
                        </span>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="rounded p-1 text-body hover:bg-neutral-tertiary hover:text-heading"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mb-1 grid grid-cols-7 gap-0">
                        {DAYS.map((d) => (
                            <div key={d} className="py-1 text-center text-[11px] font-medium text-body-subtle">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-0">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const disabled = isDisabled(day);
                            const isSelected = selected && selected.getFullYear() === viewDate.year &&
                                selected.getMonth() === viewDate.month && selected.getDate() === day;
                            const isToday = isCurrentMonth && today.getDate() === day;

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => handleSelect(day)}
                                    className={`flex h-9 w-9 items-center justify-center rounded text-[13px] transition-colors ${
                                        isSelected
                                            ? 'bg-brand text-on-brand'
                                            : isToday
                                                ? 'border border-brand text-heading'
                                                : 'text-body hover:bg-neutral-tertiary hover:text-heading'
                                    } ${disabled ? 'cursor-not-allowed opacity-30' : ''}`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
