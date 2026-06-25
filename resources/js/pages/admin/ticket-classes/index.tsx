import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SearchInput from '@/components/ui/SearchInput';
import PerPageSelector from '@/components/ui/PerPageSelector';
import Pagination from '@/components/ui/Pagination';
import AdminLayout from '@/layouts/AdminLayout';

interface TicketClass {
    id: number;
    uuid: string;
    name: string;
    code: string;
    type: string;
    seat_count: number | null;
    bedroom_count: number | null;
    description: string | null;
    facilities: string | null;
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
    type?: string;
    per_page?: number;
}

export default function Index({
    auth,
    ticketClasses,
    filters,
}: {
    auth: { user: AuthUser };
    ticketClasses: PaginatedData<TicketClass>;
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
        router.get(`/admin/ticket-classes?${params.toString()}`);
    };

    return (
        <AdminLayout auth={auth} title="Kelas Tiket">
            <Head title="Kelas Tiket" />

            <ConfirmModal
                open={!!deleteTarget}
                title="Hapus Kelas Tiket"
                message={deleteTarget ? `Hapus kelas tiket "${deleteTarget.name}"?` : ''}
                onConfirm={() => {
                    if (deleteTarget) {
                        router.delete(`/admin/ticket-classes/${deleteTarget.uuid}`);
                        setDeleteTarget(null);
                    }
                }}
                onCancel={() => setDeleteTarget(null)}
            />

            <div className="mb-6 flex items-center justify-between">
                <p className="text-[14px] text-body">
                    Daftar kelas tiket yang tersedia.
                </p>
                <Link href="/admin/ticket-classes/create" className="btn btn-brand">
                    Tambah Kelas Tiket
                </Link>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <SearchInput
                    value={filters.search ?? ''}
                    onChange={(v) => applyFilter('search', v || undefined)}
                    placeholder="Cari nama atau kode..."
                />
                <select
                    value={filters.type ?? ''}
                    onChange={(e) => applyFilter('type', e.target.value || undefined)}
                    className="input h-9 w-36 text-[13px]"
                >
                    <option value="">Semua Tipe</option>
                    <option value="seat">Kursi</option>
                    <option value="cabin">Kamar</option>
                </select>
                <div className="ml-auto">
                    <PerPageSelector
                        value={filters.per_page ?? ticketClasses.per_page}
                        onChange={(v) => applyFilter('per_page', v)}
                    />
                </div>
            </div>

            <div className="card overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-border-default bg-neutral-secondary-soft">
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Nama</th>
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Kode</th>
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Tipe</th>
                            <th className="px-4 py-3 text-right text-[13px] font-semibold text-heading">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ticketClasses.data.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-[14px] text-body">
                                    Belum ada kelas tiket.
                                </td>
                            </tr>
                        ) : (
                            ticketClasses.data.map((item) => (
                                <tr key={item.id} className="border-b border-border-default last:border-b-0">
                                    <td className="px-4 py-3 text-[14px] text-heading">{item.name}</td>
                                    <td className="px-4 py-3 text-[14px] text-body">{item.code}</td>
                                    <td className="px-4 py-3 text-[14px] text-body">{item.type === 'seat' ? 'Kursi' : 'Kamar'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/ticket-classes/${item.uuid}/edit`}
                                                className="text-[13px] font-medium text-fg-brand underline underline-offset-2 hover:no-underline"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => setDeleteTarget({ uuid: item.uuid, name: item.name })}
                                                className="text-[13px] font-medium text-fg-danger underline underline-offset-2 hover:no-underline"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={ticketClasses.links} from={ticketClasses.from} to={ticketClasses.to} total={ticketClasses.total} />
        </AdminLayout>
    );
}
