import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Ship, Clock, MapPin, X } from 'lucide-react';
import PublicLayout from '@/layouts/PublicLayout';

interface TicketClass {
    ticket_class_id: number;
    ticket_class_name: string;
    price: number;
    available_stock: number;
}

interface Leg {
    origin: string;
    destination: string;
    departure_time: string | null;
    arrival_time: string | null;
    classes: TicketClass[];
}

interface SailingInfo {
    uuid: string;
    name: string;
    ship_name: string;
    ship: { name: string; hull_number: string };
    legs: Leg[];
}

interface SchedulePageProps {
    grouped: Record<string, SailingInfo[]>;
    month: number;
    year: number;
    daysInMonth: number;
    firstDayOfWeek: number;
}

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

export default function Schedule({ grouped, month, year, daysInMonth, firstDayOfWeek }: SchedulePageProps) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(month);
    const [currentYear, setCurrentYear] = useState(year);

    const navigate = (delta: number) => {
        let m = currentMonth + delta;
        let y = currentYear;
        if (m < 1) { m = 12; y--; }
        if (m > 12) { m = 1; y++; }
        router.get(`/jadwal?month=${m}&year=${y}`, {}, { preserveState: true, preserveScroll: true });
        setCurrentMonth(m);
        setCurrentYear(y);
        setSelectedDate(null);
    };

    const sailingsOnDate = selectedDate ? (grouped[selectedDate] ?? []) : [];

    const days = useMemo(() => {
        const result: (number | null)[] = [];
        for (let i = 0; i < firstDayOfWeek; i++) {
            result.push(null);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            result.push(d);
        }
        return result;
    }, [firstDayOfWeek, daysInMonth]);

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return (
        <PublicLayout>
            <Head title={`Jadwal Kapal - ${MONTHS[currentMonth - 1]} ${currentYear}`} />

            <section className="min-h-screen bg-gradient-to-b from-brand to-brand-strong pt-28 pb-16">
                <div className="section-container">
                    <div className="mb-8 text-center">
                        <h1 className="text-on-brand">Jadwal Kapal</h1>
                        <p className="mx-auto mt-2 max-w-xl text-on-brand-muted">
                            Pilih tanggal untuk melihat jadwal dan ketersediaan tiket
                        </p>
                    </div>

                    <div className="mx-auto max-w-5xl">
                        <div className="card !shadow-lg p-4 sm:p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-1 rounded px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-neutral-secondary-medium hover:text-heading"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Sebelumnya
                                </button>
                                <span className="text-[16px] font-bold text-heading">
                                    {MONTHS[currentMonth - 1]} {currentYear}
                                </span>
                                <button
                                    onClick={() => navigate(1)}
                                    className="flex items-center gap-1 rounded px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-neutral-secondary-medium hover:text-heading"
                                >
                                    Selanjutnya
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mb-2 grid grid-cols-7 gap-0">
                                {DAYS.map((d) => (
                                    <div key={d} className="py-2 text-center text-[12px] font-semibold text-body-subtle uppercase">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-0">
                                {days.map((day, i) => {
                                    if (day === null) {
                                        return <div key={`e${i}`} />;
                                    }

                                    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    const count = grouped[dateStr]?.length ?? 0;
                                    const isSelected = dateStr === selectedDate;
                                    const isToday = dateStr === todayStr;

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                                            className={`relative flex min-h-[72px] flex-col items-center justify-start gap-0.5 border border-border-default p-1.5 text-center transition-colors hover:bg-neutral-secondary-medium ${
                                                isSelected
                                                    ? 'bg-brand-softer ring-2 ring-inset ring-brand'
                                                    : ''
                                            }`}
                                        >
                                            <span className={`text-[13px] font-medium ${
                                                isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-brand text-on-brand' : 'text-heading'
                                            }`}>
                                                {day}
                                            </span>
                                            {count > 0 && (
                                                <span className="mt-auto text-[10px] font-medium text-fg-brand">
                                                    {count} jadwal
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {selectedDate && (
                            <div className="mt-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-[18px] font-bold text-on-brand">
                                        Jadwal {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </h2>
                                    <button
                                        onClick={() => setSelectedDate(null)}
                                        className="flex items-center gap-1 text-sm text-on-brand-muted hover:text-on-brand"
                                    >
                                        <X className="h-4 w-4" />
                                        Tutup
                                    </button>
                                </div>

                                {sailingsOnDate.length === 0 ? (
                                    <p className="rounded-lg bg-white/5 px-6 py-8 text-center text-on-brand-muted">
                                        Tidak ada jadwal pada tanggal ini.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {sailingsOnDate.map((sailing) => (
                                            <div key={sailing.uuid} className="card !shadow-lg overflow-hidden">
                                                <div className="border-b border-border-default bg-neutral-secondary-soft px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Ship className="h-5 w-5 text-fg-brand" />
                                                        <span className="text-[15px] font-semibold text-heading">{sailing.ship_name}</span>
                                                        <span className="rounded bg-brand-softer px-2 py-0.5 text-[12px] font-medium text-fg-brand-strong">
                                                            {sailing.name}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="divide-y divide-border-default">
                                                    {sailing.legs.map((leg, li) => (
                                                        <div key={li} className="px-5 py-4">
                                                            <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-4">
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin className="h-4 w-4 text-fg-brand" />
                                                                    <span className="text-[14px] font-medium text-heading">{leg.origin}</span>
                                                                </div>
                                                                <span className="text-body-subtle">→</span>
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin className="h-4 w-4 text-fg-brand" />
                                                                    <span className="text-[14px] font-medium text-heading">{leg.destination}</span>
                                                                </div>
                                                                {(leg.departure_time || leg.arrival_time) && (
                                                                    <div className="flex items-center gap-1 text-[12px] text-body-subtle">
                                                                        <Clock className="h-3.5 w-3.5" />
                                                                        {leg.departure_time && <span>{leg.departure_time}</span>}
                                                                        {leg.departure_time && leg.arrival_time && <span>–</span>}
                                                                        {leg.arrival_time && <span>{leg.arrival_time}</span>}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {leg.classes.length > 0 && (
                                                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                                                    {leg.classes.map((tc) => (
                                                                        <div
                                                                            key={tc.ticket_class_id}
                                                                            className="rounded border border-border-default bg-neutral-primary-soft px-4 py-3"
                                                                        >
                                                                            <div className="text-[14px] font-medium text-heading">
                                                                                {tc.ticket_class_name}
                                                                            </div>
                                                                            <div className="mt-1 text-[13px] text-fg-brand font-semibold">
                                                                                {formatPrice(tc.price)}
                                                                            </div>
                                                                            <div className="mt-0.5 text-[12px] text-body-subtle">
                                                                                Sisa: {tc.available_stock} tiket
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {leg.classes.length === 0 && (
                                                                <p className="text-[13px] text-body-subtle">
                                                                    Belum ada ketersediaan tiket untuk rute ini.
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
