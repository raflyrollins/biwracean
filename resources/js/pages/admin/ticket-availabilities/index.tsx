import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import DatePicker from '@/components/ui/DatePicker';
import SearchInput from '@/components/ui/SearchInput';
import PerPageSelector from '@/components/ui/PerPageSelector';
import Pagination from '@/components/ui/Pagination';
import AdminLayout from '@/layouts/AdminLayout';
import { cn } from '@/lib/utils';

interface Route {
    id: number;
    ship: { id: number; name: string };
    origin_port: { id: number; name: string; code: string };
    destination_port: { id: number; name: string; code: string };
}

interface Availability {
    id: number;
    uuid: string;
    date: string;
    price: number;
    available_stock: number;
    sold_stock: number;
    route: Route;
    ticket_class: { id: number; name: string; code: string };
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
    route_uuid?: string;
    ticket_class_id?: string;
    date_from?: string;
    date_to?: string;
    per_page?: number;
}

interface IndexProps {
    auth: { user: AuthUser };
    availabilities: PaginatedData<Availability>;
    filters: Filters;
    ticketClasses: { id: number; name: string; code: string }[];
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}

export default function Index({ auth, availabilities, filters, ticketClasses }: IndexProps) {
    const [deleteTarget, setDeleteTarget] = useState<{ uuid: string } | null>(null);

    const applyFilter = (key: string, value: string | number | undefined) => {
        const params = new URLSearchParams(window.location.search);
        if (value === undefined || value === '' || value === null) {
            params.delete(key);
        } else {
            params.set(key, String(value));
        }
        params.delete('page');
        router.get(`/admin/ticket-availabilities?${params.toString()}`);
    };

    return (
        <AdminLayout auth={auth} title="Ketersediaan Tiket">
            <Head title="Ketersediaan Tiket" />

            <ConfirmModal
                open={!!deleteTarget}
                title="Hapus Ketersediaan Tiket"
                message="Hapus ketersediaan tiket ini?"
                onConfirm={() => {
                    if (deleteTarget) {
                        router.delete(`/admin/ticket-availabilities/${deleteTarget.uuid}`);
                        setDeleteTarget(null);
                    }
                }}
                onCancel={() => setDeleteTarget(null)}
            />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-[14px] text-body">
                    Daftar ketersediaan tiket untuk setiap rute.
                </p>
                <Link href="/admin/ticket-availabilities/create" className="btn btn-brand">
                    Tambah Ketersediaan
                </Link>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <SearchInput
                    value={filters.search ?? ''}
                    onChange={(v) => applyFilter('search', v || undefined)}
                    placeholder="Cari kapal atau pelabuhan..."
                />
                <select
                    value={filters.ticket_class_id ?? ''}
                    onChange={(e) => applyFilter('ticket_class_id', e.target.value || undefined)}
                    className="input h-9 w-44 text-[13px]"
                >
                    <option value="">Semua Kelas</option>
                    {ticketClasses.map((tc) => (
                        <option key={tc.id} value={tc.id}>{tc.name} ({tc.code})</option>
                    ))}
                </select>
                <DatePicker
                    label="Dari tgl"
                    value={filters.date_from ?? ''}
                    onChange={(v) => applyFilter('date_from', v || undefined)}
                />
                <DatePicker
                    label="Sampai tgl"
                    value={filters.date_to ?? ''}
                    onChange={(v) => applyFilter('date_to', v || undefined)}
                />
                <div className="ml-auto">
                    <PerPageSelector
                        value={filters.per_page ?? availabilities.per_page}
                        onChange={(v) => applyFilter('per_page', v)}
                    />
                </div>
            </div>

            <div className="card overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-border-default bg-neutral-secondary-soft">
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Rute</th>
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Kelas Tiket</th>
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Tanggal</th>
                            <th className="px-4 py-3 text-right text-[13px] font-semibold text-heading">Harga</th>
                            <th className="px-4 py-3 text-right text-[13px] font-semibold text-heading">Stok Tersedia</th>
                            <th className="px-4 py-3 text-right text-[13px] font-semibold text-heading">Stok Terjual</th>
                            <th className="px-4 py-3 text-right text-[13px] font-semibold text-heading">Sisa</th>
                            <th className="px-4 py-3 text-right text-[13px] font-semibold text-heading">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {availabilities.data.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-[14px] text-body">
                                    Belum ada data ketersediaan tiket.
                                </td>
                            </tr>
                        ) : (
                            availabilities.data.map((item) => {
                                const sisa = item.available_stock - item.sold_stock;

                                return (
                                    <tr key={item.id} className="border-b border-border-default last:border-b-0">
                                        <td className="px-4 py-3 text-[14px] text-heading">
                                            {item.route.ship.name} — {item.route.origin_port.name} &rarr; {item.route.destination_port.name}
                                        </td>
                                        <td className="px-4 py-3 text-[14px] text-body">{item.ticket_class.name}</td>
                                        <td className="px-4 py-3 text-[14px] text-body">{item.date}</td>
                                        <td className="px-4 py-3 text-right text-[14px] text-heading">{formatRupiah(item.price)}</td>
                                        <td className="px-4 py-3 text-right text-[14px] text-body">{item.available_stock}</td>
                                        <td className="px-4 py-3 text-right text-[14px] text-body">{item.sold_stock}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span
                                                className={cn(
                                                    'inline-block rounded-full px-2 py-0.5 text-[13px] font-medium',
                                                    sisa === 0
                                                        ? 'bg-danger-soft text-fg-danger-strong'
                                                        : sisa <= 5
                                                            ? 'bg-warning-soft text-fg-warning-strong'
                                                            : 'bg-success-soft text-fg-success',
                                                )}
                                            >
                                                {sisa}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/ticket-availabilities/${item.uuid}/edit`}
                                                    className="text-[13px] font-medium text-fg-brand underline underline-offset-2 hover:no-underline"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteTarget({ uuid: item.uuid })}
                                                    className="text-[13px] font-medium text-fg-danger underline underline-offset-2 hover:no-underline"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={availabilities.links} from={availabilities.from} to={availabilities.to} total={availabilities.total} />
        </AdminLayout>
    );
}
