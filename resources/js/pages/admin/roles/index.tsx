import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import AdminLayout from '@/layouts/AdminLayout';

interface Role {
    id: number;
    name: string;
    slug: string;
    permissions: string[];
    users_count?: number;
    created_at: string;
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

export default function Index({
    auth,
    roles,
}: {
    auth: { user: AuthUser };
    roles: Role[];
}) {
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

    return (
        <AdminLayout auth={auth} title="Role Admin">
            <Head title="Role Admin" />

            <ConfirmModal
                open={!!deleteTarget}
                title="Hapus Role"
                message={deleteTarget ? `Hapus role "${deleteTarget.name}"? Semua admin dengan role ini akan kehilangan akses.` : ''}
                onConfirm={() => {
                    if (deleteTarget) {
                        router.delete(`/admin/roles/${deleteTarget.id}`);
                        setDeleteTarget(null);
                    }
                }}
                onCancel={() => setDeleteTarget(null)}
            />

            <div className="mb-6 flex items-center justify-between">
                <p className="text-[14px] text-body">
                    Kelola role dan izin akses admin.
                </p>
                <Link href="/admin/roles/create" className="btn btn-brand">
                    Tambah Role
                </Link>
            </div>

            <div className="card overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-border-default bg-neutral-secondary-soft">
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Nama</th>
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Slug</th>
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Izin</th>
                            <th className="px-4 py-3 text-right text-[13px] font-semibold text-heading">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-[14px] text-body">
                                    Belum ada role.
                                </td>
                            </tr>
                        ) : (
                            roles.map((role) => {
                                const isSuperadmin = role.slug === 'superadmin';
                                const permLabels: Record<string, string> = {
                                    dashboard: 'Dashboard',
                                    ships: 'Kapal',
                                    ports: 'Pelabuhan',
                                    routes: 'Rute',
                                    sailings: 'Pelayaran',
                                    ticket_classes: 'Kelas Tiket',
                                    ticket_availabilities: 'Ketersediaan Tiket',
                                    ticket_orders: 'Penjualan Tiket',
                                    users: 'Pengguna',
                                    roles: 'Role',
                                    settings: 'Pengaturan',
                                };
                                const displayPerms = isSuperadmin
                                    ? ['Semua akses']
                                    : (role.permissions ?? []).map((p: string) => permLabels[p] ?? p);

                                return (
                                    <tr key={role.id} className="border-b border-border-default last:border-b-0">
                                        <td className="px-4 py-3 text-[14px] font-medium text-heading">{role.name}</td>
                                        <td className="px-4 py-3 text-[14px] text-body">{role.slug}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {displayPerms.map((perm) => (
                                                    <span
                                                        key={perm}
                                                        className="inline-block rounded-full bg-neutral-secondary-soft px-2 py-0.5 text-[12px] text-body"
                                                    >
                                                        {perm}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/roles/${role.id}/edit`}
                                                    className="text-[13px] font-medium text-fg-brand underline underline-offset-2 hover:no-underline"
                                                >
                                                    Edit
                                                </Link>
                                                {!isSuperadmin && (
                                                    <button
                                                        onClick={() => setDeleteTarget({ id: role.id, name: role.name })}
                                                        className="text-[13px] font-medium text-fg-danger underline underline-offset-2 hover:no-underline"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
