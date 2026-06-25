import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SearchInput from '@/components/ui/SearchInput';
import PerPageSelector from '@/components/ui/PerPageSelector';
import Pagination from '@/components/ui/Pagination';
import AdminLayout from '@/layouts/AdminLayout';

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface Route {
    id: number;
    uuid: string;
    base_price: number;
    status: string;
    ship: { id: number; name: string };
    origin_port: { id: number; name: string; code?: string };
    destination_port: { id: number; name: string; code?: string };
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

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function RoutesIndex({
    auth,
    routes,
    filters,
    ships,
}: {
    auth: { user: AuthUser };
    routes: PaginatedData<Route>;
    filters: Filters;
    ships: { id: number; name: string }[];
}) {
    const [deleteTarget, setDeleteTarget] = useState<{ uuid: string } | null>(null);

    const applyFilter = (key: string, value: string | number | undefined) => {
        const params = new URLSearchParams(window.location.search);
        if (value === undefined || value === '' || value === null) {
            params.delete(key);
        } else {
            params.set(key, String(value));
        }
        params.delete('page');
        router.get(`/admin/routes?${params.toString()}`);
    };

    return (
        <AdminLayout auth={auth} title="Data Rute">
            <Head title="Data Rute" />

            <ConfirmModal
                open={!!deleteTarget}
                title="Hapus Rute"
                message="Hapus rute ini?"
                onConfirm={() => {
                    if (deleteTarget) {
                        router.delete(`/admin/routes/${deleteTarget.uuid}`);
                        setDeleteTarget(null);
                    }
                }}
                onCancel={() => setDeleteTarget(null)}
            />

            <div className="mb-6 flex items-center justify-between">
                <p className="text-[14px] text-body">
                    Daftar seluruh rute yang terdaftar.
                </p>
                <Link href="/admin/routes/create" className="btn btn-brand">
                    Tambah Rute
                </Link>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <SearchInput
                    value={filters.search ?? ''}
                    onChange={(v) => applyFilter('search', v || undefined)}
                    placeholder="Cari kapal atau pelabuhan..."
                />
                <select
                    value={filters.ship_id ?? ''}
                    onChange={(e) => applyFilter('ship_id', e.target.value || undefined)}
                    className="input h-9 w-44 text-[13px]"
                >
                    <option value="">Semua Kapal</option>
                    {ships.map((ship) => (
                        <option key={ship.id} value={ship.id}>{ship.name}</option>
                    ))}
                </select>
                <select
                    value={filters.status ?? ''}
                    onChange={(e) => applyFilter('status', e.target.value || undefined)}
                    className="input h-9 w-28 text-[13px]"
                >
                    <option value="">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                </select>
                <div className="ml-auto">
                    <PerPageSelector
                        value={filters.per_page ?? routes.per_page}
                        onChange={(v) => applyFilter('per_page', v)}
                    />
                </div>
            </div>

            <div className="card overflow-x-auto">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[14px]">
                        <thead>
                            <tr className="border-b border-border-default bg-neutral-primary-soft text-body-subtle">
                                <th className="px-4 py-3 font-medium">Kapal</th>
                                <th className="px-4 py-3 font-medium">Pelabuhan Asal → Tujuan</th>
                                <th className="px-4 py-3 font-medium">Harga Dasar</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {routes.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-body">
                                        Belum ada data rute.
                                    </td>
                                </tr>
                            )}
                            {routes.data.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-border-default text-heading last:border-b-0"
                                >
                                    <td className="px-4 py-3">{item.ship.name}</td>
                                    <td className="px-4 py-3">
                                        {item.origin_port.name} → {item.destination_port.name}
                                    </td>
                                    <td className="px-4 py-3">{formatRupiah(item.base_price)}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                                                item.status === 'active'
                                                    ? 'bg-success-soft text-fg-success'
                                                    : 'bg-danger-soft text-fg-danger'
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/admin/routes/${item.uuid}/edit`}
                                                className="text-[13px] text-fg-brand hover:underline"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => setDeleteTarget({ uuid: item.uuid })}
                                                className="text-[13px] text-fg-danger hover:underline"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination links={routes.links} from={routes.from} to={routes.to} total={routes.total} />
        </AdminLayout>
    );
}
