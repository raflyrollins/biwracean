import { Head, Link, useForm } from '@inertiajs/react';
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

export default function PortForm({
    auth,
    port,
}: {
    auth: { user: AuthUser };
    port?: Port;
}) {
    const isEditing = !!port;

    const { data, setData, post, put, processing, errors } = useForm({
        name: port?.name ?? '',
        code: port?.code ?? '',
        city: port?.city ?? '',
        address: port?.address ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/ports/${port.uuid}`);
        } else {
            post('/admin/ports');
        }
    };

    return (
        <AdminLayout
            auth={auth}
            title={isEditing ? 'Edit Pelabuhan' : 'Tambah Pelabuhan'}
            subtitle={isEditing ? `Edit data pelabuhan "${port.name}"` : 'Masukkan data pelabuhan baru'}
        >
            <Head title={isEditing ? 'Edit Pelabuhan' : 'Tambah Pelabuhan'} />

            <div className="card mx-auto max-w-2xl p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="input-label">
                            Nama Pelabuhan
                        </label>
                        <input
                            id="name"
                            type="text"
                            className="input"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="code" className="input-label">
                            Kode
                        </label>
                        <input
                            id="code"
                            type="text"
                            className="input"
                            maxLength={10}
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                        />
                        {errors.code && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.code}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="city" className="input-label">
                            Kota
                        </label>
                        <input
                            id="city"
                            type="text"
                            className="input"
                            value={data.city}
                            onChange={(e) => setData('city', e.target.value)}
                        />
                        {errors.city && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.city}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="address" className="input-label">
                            Alamat
                        </label>
                        <textarea
                            id="address"
                            className="input min-h-[100px]"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                        />
                        {errors.address && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.address}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button type="submit" className="btn btn-brand" disabled={processing}>
                            {processing ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan'}
                        </button>
                        <Link href="/admin/ports" className="btn btn-white">
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
