import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SearchInput from '@/components/ui/SearchInput';
import PerPageSelector from '@/components/ui/PerPageSelector';
import Pagination from '@/components/ui/Pagination';
import AdminLayout from '@/layouts/AdminLayout';

interface Ship {
    id: number;
    name: string;
}

interface Port {
    id: number;
    name: string;
    code: string;
}

interface Leg {
    id: number;
    leg_order: number;
    origin_port: Port;
    destination_port: Port;
    departure_time: string | null;
    arrival_time: string | null;
}

interface Sailing {
    id: number;
    uuid: string;
    name: string;
    departure_date: string;
    arrival_date: string | null;
    status: string;
    ship: Ship;
    legs: Leg[];
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
    search?: string;
    status?: string;
    ship_id?: string;
    per_page?: number;
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

export default function SailingsIndex({
    auth,
    sailings,
    filters,
    ships,
}: {
    auth: { user: AuthUser };
    sailings: PaginatedData<Sailing>;
    filters: Filters;
    ships: Ship[];
}) {
    const [deleteTarget, setDeleteTarget] = useState<{ uuid: string; name: string } | null>(null);

    const applyFilter = (key: string, value: string | number | undefined) => {
        const params = new URLSearchParams(window.location.search);
        if (value === undefined || value === '' || value === null) {
            params.delete(key);
        } else {
            params.set(key, String(value));
        }
        params.delete('page');
        router.get(`/admin/sailings?${params.toString()}`);
    };

    return (
        <AdminLayout auth={auth} title="Pelayaran">
            <Head title="Pelayaran" />

            <ConfirmModal
                open={!!deleteTarget}
                title="Hapus Pelayaran"
                message={deleteTarget ? `Hapus pelayaran "${deleteTarget.name}"?` : ''}
                onConfirm={() => {
                    if (deleteTarget) {
                        router.delete(`/admin/sailings/${deleteTarget.uuid}`);
                        setDeleteTarget(null);
                    }
                }}
                onCancel={() => setDeleteTarget(null)}
            />

            <div className="mb-6 flex items-center justify-between">
                <p className="text-[14px] text-body">Daftar seluruh pelayaran kapal.</p>
                <Link href="/admin/sailings/create" className="btn btn-brand">
                    Tambah Pelayaran
                </Link>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <SearchInput
                    value={filters.search ?? ''}
                    onChange={(v) => applyFilter('search', v || undefined)}
                    placeholder="Cari pelayaran atau kapal..."
                />
                <select
                    value={filters.status ?? ''}
                    onChange={(e) => applyFilter('status', e.target.value || undefined)}
                    className="input h-9 w-36 text-[13px]"
                >
                    <option value="">Semua Status</option>
                    <option value="scheduled">Terjadwal</option>
                    <option value="in_progress">Sedang Berlayar</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                </select>
                <select
                    value={filters.ship_id ?? ''}
                    onChange={(e) => applyFilter('ship_id', e.target.value || undefined)}
                    className="input h-9 w-44 text-[13px]"
                >
                    <option value="">Semua Kapal</option>
                    {ships.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                <div className="ml-auto">
                    <PerPageSelector
                        value={filters.per_page ?? sailings.per_page}
                        onChange={(v) => applyFilter('per_page', v)}
                    />
                </div>
            </div>

            <div className="space-y-4">
                {sailings.data.length === 0 ? (
                    <div className="card p-8 text-center text-[14px] text-body">
                        Belum ada data pelayaran.
                    </div>
                ) : (
                    sailings.data.map((sailing) => (
                        <div key={sailing.id} className="card overflow-x-auto">
                            <div className="flex items-start justify-between p-5">
                                <div className="min-w-0 flex-1">
                                    <div className="mb-2 flex items-center gap-3">
                                        <Link
                                            href={`/admin/sailings/${sailing.uuid}`}
                                            className="text-[16px] font-semibold text-heading hover:text-fg-brand"
                                        >
                                            {sailing.name}
                                        </Link>
                                        <span
                                            className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusColors[sailing.status]}`}
                                        >
                                            {statusLabels[sailing.status]}
                                        </span>
                                    </div>
                                    <p className="mb-3 text-[13px] text-body-subtle">
                                        {sailing.ship.name}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-body">
                                        {sailing.legs.map((leg, idx) => (
                                            <span key={leg.id}>
                                                {idx === 0 && (
                                                    <span className="font-medium text-heading">
                                                        {leg.origin_port.name}
                                                    </span>
                                                )}
                                                <span className="mx-1 text-body-subtle">&rarr;</span>
                                                <span className="font-medium text-heading">
                                                    {leg.destination_port.name}
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-[12px] text-body-subtle">
                                        {sailing.departure_date}
                                        {sailing.arrival_date && ` — ${sailing.arrival_date}`}
                                    </div>
                                </div>
                                <div className="ml-4 flex shrink-0 items-center gap-2">
                                    <Link
                                        href={`/admin/sailings/${sailing.uuid}/edit`}
                                        className="text-[13px] font-medium text-fg-brand underline underline-offset-2 hover:no-underline"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => setDeleteTarget({ uuid: sailing.uuid, name: sailing.name })}
                                        className="text-[13px] font-medium text-fg-danger underline underline-offset-2 hover:no-underline"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Pagination links={sailings.links} from={sailings.from} to={sailings.to} total={sailings.total} />
        </AdminLayout>
    );
}
