import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    role?: { id: number; name: string; slug: string } | null;
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface FormProps {
    auth: { user: AuthUser };
    user?: User;
    roles: Role[];
}

export default function Form({ auth, user, roles }: FormProps) {
    const isEditing = !!user;

    const { data, setData, post, patch, processing, errors } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        is_admin: user?.is_admin ?? false,
        role_id: user?.role?.id ?? null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEditing) {
            patch(`/admin/users/${user.id}`);
        } else {
            post('/admin/users');
        }
    };

    return (
        <AdminLayout
            auth={auth}
            title={isEditing ? 'Edit Pengguna' : 'Tambah Pengguna'}
        >
            <Head title={isEditing ? 'Edit Pengguna' : 'Tambah Pengguna'} />

            <Link
                href="/admin/users"
                className="mb-6 inline-flex items-center gap-1 text-[14px] font-medium text-fg-brand underline underline-offset-2 hover:no-underline"
            >
                &larr; Kembali
            </Link>

            <div className="card max-w-2xl p-6">
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="input-label">Nama</label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="input"
                            placeholder="Nama lengkap"
                        />
                        {errors.name && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="input-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="input"
                            placeholder="user@example.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="input-label">
                            Password {isEditing ? '(kosongkan jika tidak diubah)' : ''}
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="input"
                            placeholder={isEditing ? 'Biarkan kosong' : 'Minimal 8 karakter'}
                        />
                        {errors.password && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.password}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="is_admin"
                            type="checkbox"
                            checked={data.is_admin}
                            onChange={(e) => {
                                setData('is_admin', e.target.checked);
                                if (!e.target.checked) {
                                    setData('role_id', null);
                                }
                            }}
                            className="h-4 w-4 accent-brand"
                        />
                        <label htmlFor="is_admin" className="text-[14px] text-body">
                            Admin
                        </label>
                        {errors.is_admin && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.is_admin}</p>
                        )}
                    </div>

                    {data.is_admin && (
                        <div>
                            <label htmlFor="role_id" className="input-label">Role</label>
                            <select
                                id="role_id"
                                value={data.role_id ?? ''}
                                onChange={(e) => setData('role_id', e.target.value ? Number(e.target.value) : null)}
                                className="input"
                            >
                                <option value="">Pilih role...</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                            {errors.role_id && (
                                <p className="mt-1 text-[12px] text-fg-danger">{errors.role_id}</p>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button type="submit" className="btn btn-brand" disabled={processing}>
                            {processing ? 'Menyimpan...' : isEditing ? 'Perbarui' : 'Simpan'}
                        </button>
                        <Link href="/admin/users">
                            <span className="btn btn-white">Batal</span>
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
