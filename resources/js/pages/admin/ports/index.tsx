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

interface Port {
    id: number;
    uuid: string;
    name: string;
    code: string;
    city: string;
    address: string;
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
    per_page?: number;
}

export default function PortsIndex({
    auth,
    ports,
    filters,
}: {
    auth: { user: AuthUser };
    ports: PaginatedData<Port>;
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
        router.get(`/admin/ports?${params.toString()}`);
    };

    return (
        <AdminLayout auth={auth} title="Data Pelabuhan">
            <Head title="Data Pelabuhan" />

            <ConfirmModal
                open={!!deleteTarget}
                title="Hapus Pelabuhan"
                message={deleteTarget ? `Hapus pelabuhan "${deleteTarget.name}"?` : ''}
                onConfirm={() => {
                    if (deleteTarget) {
                        router.delete(`/admin/ports/${deleteTarget.uuid}`);
                        setDeleteTarget(null);
                    }
                }}
                onCancel={() => setDeleteTarget(null)}
            />

            <div className="mb-6 flex items-center justify-between">
                <p className="text-[14px] text-body">
                    Daftar seluruh pelabuhan yang terdaftar.
                </p>
                <Link href="/admin/ports/create" className="btn btn-brand">
                    Tambah Pelabuhan
                </Link>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <SearchInput
                    value={filters.search ?? ''}
                    onChange={(v) => applyFilter('search', v || undefined)}
                    placeholder="Cari nama atau kode..."
                />
                <div className="ml-auto">
                    <PerPageSelector
                        value={filters.per_page ?? ports.per_page}
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
                                <th className="px-4 py-3 font-medium">Kode</th>
                                <th className="px-4 py-3 font-medium">Kota</th>
                                <th className="px-4 py-3 font-medium">Alamat</th>
                                <th className="px-4 py-3 font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ports.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-body">
                                        Belum ada data pelabuhan.
                                    </td>
                                </tr>
                            )}
                            {ports.data.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-border-default text-heading last:border-b-0"
                                >
                                    <td className="px-4 py-3">{item.name}</td>
                                    <td className="px-4 py-3">{item.code}</td>
                                    <td className="px-4 py-3">{item.city}</td>
                                    <td className="px-4 py-3">{item.address}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/admin/ports/${item.uuid}/edit`}
                                                className="text-[13px] text-fg-brand hover:underline"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => setDeleteTarget({ uuid: item.uuid, name: item.name })}
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

            <Pagination links={ports.links} from={ports.from} to={ports.to} total={ports.total} />
        </AdminLayout>
    );
}
