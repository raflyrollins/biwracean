import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface Rute {
    id: number;
    uuid: string;
    harga_dasar: number;
    status: string;
    kapal: { id: number; nama: string };
    pelabuhan_asal: { id: number; nama: string };
    pelabuhan_tujuan: { id: number; nama: string };
}

interface PaginatedData<T> {
    data: T[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function RuteIndex({
    auth,
    rute,
}: {
    auth: { user: AuthUser };
    rute: PaginatedData<Rute>;
}) {
    const handleDelete = (uuid: string) => {
        if (confirm('Hapus rute ini?')) {
            router.delete(`/admin/rute/${uuid}`);
        }
    };

    return (
        <AdminLayout auth={auth} title="Data Rute">
            <Head title="Data Rute" />

            <div className="mb-6 flex items-center justify-between">
                <p className="text-[14px] text-body">
                    Daftar seluruh rute yang terdaftar.
                </p>
                <Link href="/admin/rute/create" className="btn btn-brand">
                    Tambah Rute
                </Link>
            </div>

            <div className="card overflow-x-auto">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[14px]">
                        <thead>
                            <tr className="border-b border-border-default bg-neutral-primary-soft text-body-subtle">
                                <th className="px-4 py-3 font-medium">Kapal</th>
                                <th className="px-4 py-3 font-medium">
                                    Pelabuhan Asal → Tujuan
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Harga Dasar
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-3 font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rute.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-8 text-center text-body"
                                    >
                                        Belum ada data rute.
                                    </td>
                                </tr>
                            )}
                            {rute.data.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-border-default text-heading last:border-b-0"
                                >
                                    <td className="px-4 py-3">
                                        {item.kapal.nama}
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.pelabuhan_asal.nama} →{' '}
                                        {item.pelabuhan_tujuan.nama}
                                    </td>
                                    <td className="px-4 py-3">
                                        {formatRupiah(item.harga_dasar)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                                                item.status === 'aktif'
                                                    ? 'text-fg-success bg-success-soft'
                                                    : 'bg-danger-soft text-fg-danger'
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/admin/rute/${item.uuid}/edit`}
                                                className="text-[13px] text-fg-brand hover:underline"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleDelete(item.uuid)
                                                }
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

            {rute.links.length > 1 && (
                <div className="mt-6 flex items-center justify-center gap-1">
                    {rute.links.map((link, i) => {
                        if (!link.url) {
                            return (
                                <span
                                    key={i}
                                    className="rounded-md px-3 py-1.5 text-[13px] text-body-subtle"
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            );
                        }

                        return link.active ? (
                            <span
                                key={i}
                                className="rounded-md bg-brand-strong px-3 py-1.5 text-[13px] text-white"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <Link
                                key={i}
                                href={link.url}
                                className="rounded-md px-3 py-1.5 text-[13px] text-body transition-colors hover:bg-neutral-secondary-medium hover:text-heading"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    })}
                </div>
            )}
        </AdminLayout>
    );
}
