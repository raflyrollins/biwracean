import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

export default function AdminDashboard({ auth }: { auth: { user: AuthUser } }) {
    return (
        <AdminLayout
            auth={auth}
            title="Dashboard"
            subtitle="Panel administrasi biwracean"
        >
            <Head title="Dashboard" />

            {/* Welcome */}
            <div className="mb-8">
                <h2 className="text-[22px] font-bold text-heading">
                    Selamat datang, {auth.user.name}!
                </h2>
                <p className="mt-1 text-[14px] text-body">
                    Panel administrasi biwracean. Kelola data kapal, rute, dan
                    pengaturan sistem di sini.
                </p>
            </div>

            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Kapal', value: '—' },
                    { label: 'Total Rute', value: '—' },
                    { label: 'Pelabuhan', value: '—' },
                    { label: 'Pengguna', value: '—' },
                ].map((card) => (
                    <div key={card.label} className="card p-6">
                        <p className="text-[14px] text-body">{card.label}</p>
                        <p className="mt-2 text-[28px] font-bold text-heading">
                            {card.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Content sections */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="card p-6">
                    <h3 className="mb-4 text-[20px] font-semibold text-heading">
                        Kapal Terbaru
                    </h3>
                    <p className="text-[14px] text-body">
                        Belum ada data kapal. Fitur ini akan segera tersedia.
                    </p>
                </div>
                <div className="card p-6">
                    <h3 className="mb-4 text-[20px] font-semibold text-heading">
                        Aktivitas Terkini
                    </h3>
                    <p className="text-[14px] text-body">
                        Belum ada aktivitas. Fitur ini akan segera tersedia.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}
