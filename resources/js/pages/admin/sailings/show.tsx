import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';

interface Port {
    id: number;
    name: string;
    code: string;
}

interface TicketClass {
    id: number;
    name: string;
    code: string;
}

interface ShipTicketClass {
    id: number;
    ticket_class_id: number;
    seat_count: number | null;
    bedroom_count: number | null;
    ticket_class: TicketClass;
}

interface Ship {
    id: number;
    name: string;
    hull_number: string;
    capacity: number;
    ship_type: string;
    status: string;
    ship_ticket_classes: ShipTicketClass[];
}

interface ClassStock {
    ticket_class_id: number;
    ticket_class_name: string;
    sold: number;
    available: number;
}

interface LegStock {
    id: number;
    leg_order: number;
    origin: { id: number; name: string; code: string };
    destination: { id: number; name: string; code: string };
    departure_time: string | null;
    arrival_time: string | null;
    route_uuid: string | null;
    class_stock: ClassStock[];
    ticket_availabilities_count: number;
}

interface ClassStockSummary {
    ticket_class_id: number;
    ticket_class_name: string;
    capacity: number;
    total_sold: number;
    total_available: number;
}

interface Sailing {
    id: number;
    uuid: string;
    name: string;
    departure_date: string;
    arrival_date: string | null;
    status: string;
    ship: Ship;
    legs: { id: number; leg_order: number; origin_port_id: number; destination_port_id: number; departure_time: string | null; arrival_time: string | null; origin_port: Port; destination_port: Port }[];
}

interface ShowProps {
    auth: { user: { id: number; name: string; email: string } };
    sailing: Sailing;
    legsWithStock: LegStock[];
    classStockSummary: ClassStockSummary[];
}

const statusLabels: Record<string, string> = {
    scheduled: 'Terjadwal',
    in_progress: 'Sedang Berlayar',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const statusColors: Record<string, string> = {
    scheduled: 'bg-info-soft text-fg-info-strong',
    in_progress: 'bg-warning-soft text-fg-warning-strong',
    completed: 'bg-success-soft text-fg-success',
    cancelled: 'bg-danger-soft text-fg-danger',
};

const shipTypeLabels: Record<string, string> = {
    passenger: 'Angkutan Orang',
    cargo: 'Angkutan Barang',
    vehicle_ferry: 'Penyeberangan Kendaraan',
    mixed: 'Campuran',
};

export default function SailingShow({ auth, sailing, legsWithStock, classStockSummary }: ShowProps) {
    return (
        <AdminLayout
            auth={auth}
            title={sailing.name}
            subtitle={`Pelayaran ${sailing.ship.name}`}
        >
            <Head title={sailing.name} />

            <Link
                href="/admin/sailings"
                className="mb-6 inline-flex items-center gap-1 text-[14px] font-medium text-fg-brand underline underline-offset-2 hover:no-underline"
            >
                &larr; Kembali
            </Link>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Info Kapal */}
                <div className="card p-5 lg:col-span-1">
                    <h3 className="mb-4 text-[16px] font-semibold text-heading">Informasi Kapal</h3>

                    <div className="space-y-3">
                        <div>
                            <p className="text-[12px] text-body-subtle">Nama Kapal</p>
                            <p className="text-[14px] font-medium text-heading">{sailing.ship.name}</p>
                        </div>
                        <div>
                            <p className="text-[12px] text-body-subtle">Nomor Lambung</p>
                            <p className="text-[14px] text-heading">{sailing.ship.hull_number}</p>
                        </div>
                        <div>
                            <p className="text-[12px] text-body-subtle">Tipe</p>
                            <p className="text-[14px] text-heading">{shipTypeLabels[sailing.ship.ship_type]}</p>
                        </div>
                        <div>
                            <p className="text-[12px] text-body-subtle">Kapasitas</p>
                            <p className="text-[14px] text-heading">{sailing.ship.capacity} orang</p>
                        </div>
                    </div>

                    {sailing.ship.ship_ticket_classes.length > 0 && (
                        <div className="mt-4 border-t border-border-default pt-4">
                            <p className="mb-2 text-[12px] font-medium text-body-subtle">Konfigurasi Kelas</p>
                            <div className="space-y-2">
                                {sailing.ship.ship_ticket_classes.map((stc) => (
                                    <div key={stc.id} className="rounded-md bg-neutral-secondary-soft p-2">
                                        <p className="text-[13px] font-medium text-heading">
                                            {stc.ticket_class.name}
                                        </p>
                                        <p className="text-[12px] text-body-subtle">
                                            {stc.seat_count
                                                ? `${stc.seat_count} kursi`
                                                : stc.bedroom_count
                                                    ? `${stc.bedroom_count} kamar`
                                                    : 'Tidak ditentukan'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Rute Pelayaran - Card View */}
                <div className="lg:col-span-2">
                    <div className="card p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-[16px] font-semibold text-heading">Rute Pelayaran</h3>
                                <p className="text-[13px] text-body-subtle">
                                    {sailing.departure_date}
                                    {sailing.arrival_date && ` — ${sailing.arrival_date}`}
                                </p>
                            </div>
                            <span
                                className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusColors[sailing.status]}`}
                            >
                                {statusLabels[sailing.status]}
                            </span>
                        </div>

                        {/* Journey Timeline */}
                        <div className="relative">
                            {legsWithStock.map((leg, idx) => (
                                <div key={leg.id} className="relative flex gap-4 pb-8 last:pb-0">
                                    {/* Timeline connector */}
                                    <div className="flex w-10 shrink-0 flex-col items-center">
                                        <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-[13px] font-bold text-fg-brand ring-2 ring-white">
                                            {leg.leg_order}
                                        </div>
                                        {idx < legsWithStock.length - 1 && (
                                            <div className="-mb-2 mt-1 h-full w-0.5 bg-border-default" />
                                        )}
                                    </div>

                                    {/* Leg card */}
                                    <div className="min-w-0 flex-1 rounded-lg border border-border-default bg-neutral-secondary-soft p-4 transition-shadow hover:shadow-sm">
                                        <div className="mb-2 flex items-start justify-between">
                                            <div>
                                                <p className="text-[15px] font-semibold text-heading">
                                                    {leg.origin.name}{' '}
                                                    <span className="text-body-subtle">&rarr;</span>{' '}
                                                    {leg.destination.name}
                                                </p>
                                            </div>
                                            {leg.route_uuid && (
                                                <Link
                                                    href={`/admin/ticket-availabilities?route_uuid=${leg.route_uuid}`}
                                                    className="shrink-0 text-[12px] text-fg-brand underline underline-offset-2 hover:no-underline"
                                                >
                                                    Kelola Tiket
                                                </Link>
                                            )}
                                        </div>

                                        {(leg.departure_time || leg.arrival_time) && (
                                            <div className="mb-2 flex gap-4 text-[13px] text-body-subtle">
                                                {leg.departure_time && (
                                                    <span>Berangkat: {leg.departure_time}</span>
                                                )}
                                                {leg.arrival_time && (
                                                    <span>Tiba: {leg.arrival_time}</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-1 text-[13px] text-body">
                                            {leg.class_stock.map((cs) => (
                                                <div key={cs.ticket_class_id} className="flex items-center gap-2">
                                                    <span className="w-20 shrink-0 font-medium text-heading">
                                                        {cs.ticket_class_name}:
                                                    </span>
                                                    <span>
                                                        {cs.available} tiket ({cs.sold} terjual)
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ship Class Capacity Summary */}
                    {classStockSummary.length > 0 && (
                        <div className="card mt-6 p-5">
                            <h3 className="mb-4 text-[16px] font-semibold text-heading">
                                Kapasitas Kelas vs Stok Terjual
                            </h3>
                            <p className="mb-3 text-[13px] text-body-subtle">
                                Total stok terjual di semua leg vs kapasitas kapal per kelas.
                            </p>
                            <div className="space-y-3">
                                {classStockSummary.map((cls) => {
                                    const percentage = cls.capacity > 0
                                        ? Math.round((cls.total_sold / cls.capacity) * 100)
                                        : 0;

                                    return (
                                        <div key={cls.ticket_class_id} className="rounded-lg border border-border-default p-3">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-[14px] font-medium text-heading">
                                                    {cls.ticket_class_name}
                                                </span>
                                                <span className="text-[13px] text-body-subtle">
                                                    {cls.total_sold} / {cls.capacity} ({percentage}%)
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-secondary-medium">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        percentage > 90
                                                            ? 'bg-danger-strong'
                                                            : percentage > 70
                                                                ? 'bg-warning-strong'
                                                                : 'bg-success-strong'
                                                    }`}
                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
