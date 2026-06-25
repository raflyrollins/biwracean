import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SearchInput from '@/components/ui/SearchInput';
import PerPageSelector from '@/components/ui/PerPageSelector';
import Pagination from '@/components/ui/Pagination';
import AdminLayout from '@/layouts/AdminLayout';
import { cn } from '@/lib/utils';

interface User {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    role?: { id: number; name: string; slug: string } | null;
    created_at: string;
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
    per_page?: number;
}

export default function Index({
    auth,
    users,
    filters,
}: {
    auth: { user: AuthUser };
    users: PaginatedData<User>;
    filters: Filters;
}) {
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

    const applyFilter = (key: string, value: string | number | undefined) => {
        const params = new URLSearchParams(window.location.search);
        if (value === undefined || value === '' || value === null) {
            params.delete(key);
        } else {
            params.set(key, String(value));
        }
        params.delete('page');
        router.get(`/admin/users?${params.toString()}`);
    };

    return (
        <AdminLayout auth={auth} title="Pengguna">
            <Head title="Pengguna" />

            <ConfirmModal
                open={!!deleteTarget}
                title="Hapus Pengguna"
                message={deleteTarget ? `Hapus pengguna "${deleteTarget.name}"?` : ''}
                onConfirm={() => {
                    if (deleteTarget) {
                        router.delete(`/admin/users/${deleteTarget.id}`);
                        setDeleteTarget(null);
                    }
                }}
                onCancel={() => setDeleteTarget(null)}
            />

            <div className="mb-6 flex items-center justify-between">
                <p className="text-[14px] text-body">
                    Daftar pengguna yang terdaftar.
                </p>
                <Link href="/admin/users/create" className="btn btn-brand">
                    Tambah Pengguna
                </Link>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <SearchInput
                    value={filters.search ?? ''}
                    onChange={(v) => applyFilter('search', v || undefined)}
                    placeholder="Cari nama atau email..."
                />
                <div className="ml-auto">
                    <PerPageSelector
                        value={filters.per_page ?? users.per_page}
                        onChange={(v) => applyFilter('per_page', v)}
                    />
                </div>
            </div>

            <div className="card overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-border-default bg-neutral-secondary-soft">
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Nama</th>
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Email</th>
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Admin</th>
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Role</th>
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Bergabung</th>
                            <th className="px-4 py-3 text-right text-[13px] font-semibold text-heading">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-[14px] text-body">
                                    Belum ada pengguna.
                                </td>
                            </tr>
                        ) : (
                            users.data.map((user) => (
                                <tr key={user.id} className="border-b border-border-default last:border-b-0">
                                    <td className="px-4 py-3 text-[14px] text-heading">{user.name}</td>
                                    <td className="px-4 py-3 text-[14px] text-body">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={cn(
                                                'inline-block rounded-full px-2 py-0.5 text-[13px] font-medium',
                                                user.is_admin
                                                    ? 'bg-success-soft text-fg-success'
                                                    : 'bg-neutral-secondary-soft text-body',
                                            )}
                                        >
                                            {user.is_admin ? 'Ya' : 'Tidak'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-[14px] text-body">
                                        {user.role?.name ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-[14px] text-body">
                                        {new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/users/${user.id}/edit`}
                                                className="text-[13px] font-medium text-fg-brand underline underline-offset-2 hover:no-underline"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => setDeleteTarget({ id: user.id, name: user.name })}
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

            <Pagination links={users.links} from={users.from} to={users.to} total={users.total} />
        </AdminLayout>
    );
}
