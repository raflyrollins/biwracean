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

interface Ship {
    id: number;
    uuid: string;
    name: string;
    hull_number: string;
    capacity: number;
    ship_type: string;
    status: string;
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
    ship_type?: string;
    status?: string;
    per_page?: number;
}

const shipTypeLabels: Record<string, string> = {
    passenger: 'Angkutan Orang',
    cargo: 'Angkutan Barang',
    vehicle_ferry: 'Penyeberangan Kendaraan',
    mixed: 'Campuran',
};

export default function ShipsIndex({
    auth,
    ships,
    filters,
}: {
    auth: { user: AuthUser };
    ships: PaginatedData<Ship>;
    filters: Filters;
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
        router.get(`/admin/ships?${params.toString()}`);
    };

    return (
        <AdminLayout auth={auth} title="Data Kapal">
            <Head title="Data Kapal" />

            <ConfirmModal
                open={!!deleteTarget}
                title="Hapus Kapal"
                message={deleteTarget ? `Hapus kapal "${deleteTarget.name}"?` : ''}
                onConfirm={() => {
                    if (deleteTarget) {
                        router.delete(`/admin/ships/${deleteTarget.uuid}`);
                        setDeleteTarget(null);
                    }
                }}
                onCancel={() => setDeleteTarget(null)}
            />

            <div className="mb-6 flex items-center justify-between">
                <p className="text-[14px] text-body">Daftar seluruh kapal yang terdaftar.</p>
                <Link href="/admin/ships/create" className="btn btn-brand">
                    Tambah Kapal
                </Link>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <SearchInput
                    value={filters.search ?? ''}
                    onChange={(v) => applyFilter('search', v || undefined)}
                    placeholder="Cari nama atau lambung..."
                />
                <select
                    value={filters.ship_type ?? ''}
                    onChange={(e) => applyFilter('ship_type', e.target.value || undefined)}
                    className="input h-9 w-44 text-[13px]"
                >
                    <option value="">Semua Tipe</option>
                    {Object.entries(shipTypeLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
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
                        value={filters.per_page ?? ships.per_page}
                        onChange={(v) => applyFilter('per_page', v)}
                    />
                </div>
            </div>

            <div className="card overflow-x-auto">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[14px]">
                        <thead>
                            <tr className="border-b border-border-default bg-neutral-primary-soft text-body-subtle">
                                <th className="px-4 py-3 font-medium">Nama</th>
                                <th className="px-4 py-3 font-medium">Nomor Lambung</th>
                                <th className="px-4 py-3 font-medium">Tipe</th>
                                <th className="px-4 py-3 font-medium">Kapasitas</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ships.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-body">
                                        Belum ada data kapal.
                                    </td>
                                </tr>
                            )}
                            {ships.data.map((item) => (
                                <tr key={item.id} className="border-b border-border-default text-heading last:border-b-0">
                                    <td className="px-4 py-3">{item.name}</td>
                                    <td className="px-4 py-3">{item.hull_number}</td>
                                    <td className="px-4 py-3 text-body">{shipTypeLabels[item.ship_type] ?? item.ship_type}</td>
                                    <td className="px-4 py-3">{item.capacity}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium ${item.status === 'active' ? 'bg-success-soft text-fg-success' : 'bg-danger-soft text-fg-danger'}`}>
                                            {item.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/ships/${item.uuid}/edit`} className="text-[13px] text-fg-brand hover:underline">
                                                Edit
                                            </Link>
                                            <button onClick={() => setDeleteTarget({ uuid: item.uuid, name: item.name })} className="text-[13px] text-fg-danger hover:underline">
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

            <Pagination links={ships.links} from={ships.from} to={ships.to} total={ships.total} />
        </AdminLayout>
    );
}
