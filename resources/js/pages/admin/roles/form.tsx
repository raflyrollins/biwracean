import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

interface PermissionOption {
    key: string;
    label: string;
    group: string;
}

interface Role {
    id: number;
    name: string;
    slug: string;
    permissions: string[];
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface FormProps {
    auth: { user: AuthUser };
    role?: Role;
    permissionList: PermissionOption[];
}

export default function Form({ auth, role, permissionList }: FormProps) {
    const isEditing = !!role;
    const isSuperadmin = role?.slug === 'superadmin';

    const { data, setData, post, patch, processing, errors } = useForm({
        name: role?.name ?? '',
        slug: role?.slug ?? '',
        permissions: role?.permissions ?? [],
    });

    const groups = [...new Set(permissionList.map((p) => p.group))];

    const togglePermission = (key: string) => {
        if (isSuperadmin) return;

        setData('permissions', data.permissions.includes(key)
            ? data.permissions.filter((p: string) => p !== key)
            : [...data.permissions, key],
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEditing) {
            patch(`/admin/roles/${role.id}`);
        } else {
            post('/admin/roles');
        }
    };

    return (
        <AdminLayout
            auth={auth}
            title={isEditing ? 'Edit Role' : 'Tambah Role'}
        >
            <Head title={isEditing ? 'Edit Role' : 'Tambah Role'} />

            <Link
                href="/admin/roles"
                className="mb-6 inline-flex items-center gap-1 text-[14px] font-medium text-fg-brand underline underline-offset-2 hover:no-underline"
            >
                &larr; Kembali
            </Link>

            <div className="card max-w-2xl p-6">
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="input-label">Nama Role</label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="input"
                            placeholder="Misal: Admin Tiket"
                            disabled={isSuperadmin}
                        />
                        {errors.name && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="slug" className="input-label">Slug</label>
                        <input
                            id="slug"
                            type="text"
                            value={data.slug}
                            onChange={(e) => setData('slug', e.target.value)}
                            className="input"
                            placeholder="admin_tiket"
                            disabled={isSuperadmin}
                        />
                        {errors.slug && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.slug}</p>
                        )}
                    </div>

                    <div>
                        <label className="input-label">Izin Akses</label>
                        {isSuperadmin ? (
                            <p className="text-[14px] text-body">Superadmin memiliki semua akses.</p>
                        ) : (
                            <div className="space-y-4">
                                {groups.map((group) => (
                                    <div key={group}>
                                        <p className="mb-2 text-[13px] font-medium text-heading">{group}</p>
                                        <div className="flex flex-wrap gap-3">
                                            {permissionList
                                                .filter((p) => p.group === group)
                                                .map((perm) => (
                                                    <label
                                                        key={perm.key}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={data.permissions.includes(perm.key)}
                                                            onChange={() => togglePermission(perm.key)}
                                                            className="h-4 w-4 accent-brand"
                                                        />
                                                        <span className="text-[14px] text-body">{perm.label}</span>
                                                    </label>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.permissions && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.permissions}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button type="submit" className="btn btn-brand" disabled={processing}>
                            {processing ? 'Menyimpan...' : isEditing ? 'Perbarui' : 'Simpan'}
                        </button>
                        <Link href="/admin/roles">
                            <span className="btn btn-white">Batal</span>
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
