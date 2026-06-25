import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface Ship {
    id: number;
    name: string;
    hull_number: string;
    capacity: number;
    status: string;
}

interface Route {
    ship: Ship;
}

interface Availability {
    id: number;
    route: Route;
    ticket_class: { id: number; name: string; code: string };
    date: string;
    price: number;
    available_stock: number;
    sold_stock: number;
}

export default function AdminDashboard({
    auth,
    totalShips,
    totalRoutes,
    totalPorts,
    totalUsers,
    latestShips,
    latestAvailabilities,
}: {
    auth: { user: AuthUser };
    totalShips: number;
    totalRoutes: number;
    totalPorts: number;
    totalUsers: number;
    latestShips: Ship[];
    latestAvailabilities: Availability[];
}) {
    return (
        <AdminLayout
            auth={auth}
            title="Dashboard"
            subtitle="Panel administrasi biwracean"
        >
            <Head title="Dashboard" />

            <div className="mb-8">
                <h2 className="text-[22px] font-bold text-heading">
                    Selamat datang, {auth.user.name}!
                </h2>
                <p className="mt-1 text-[14px] text-body">
                    Panel administrasi biwracean. Kelola data kapal, rute, dan
                    pengaturan sistem di sini.
                </p>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Kapal', value: totalShips },
                    { label: 'Total Rute', value: totalRoutes },
                    { label: 'Pelabuhan', value: totalPorts },
                    { label: 'Pengguna', value: totalUsers },
                ].map((card) => (
                    <div key={card.label} className="card p-6">
                        <p className="text-[14px] text-body">{card.label}</p>
                        <p className="mt-2 text-[28px] font-bold text-heading">
                            {card.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="card p-6">
                    <h3 className="mb-4 text-[20px] font-semibold text-heading">
                        Kapal Terbaru
                    </h3>
                    {latestShips.length > 0 ? (
                        <ul className="divide-y divide-border-default">
                            {latestShips.map((k) => (
                                <li key={k.id} className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="text-[14px] font-medium text-heading">
                                            {k.name}
                                        </p>
                                        <p className="text-[12px] text-body-subtle">
                                            {k.hull_number} &middot; {k.capacity} kursi
                                        </p>
                                    </div>
                                    <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                                        k.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {k.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-[14px] text-body">
                            Belum ada data kapal.
                        </p>
                    )}
                </div>
                <div className="card p-6">
                    <h3 className="mb-4 text-[20px] font-semibold text-heading">
                        Ketersediaan Tiket Terbaru
                    </h3>
                    {latestAvailabilities.length > 0 ? (
                        <ul className="divide-y divide-border-default">
                            {latestAvailabilities.map((k) => (
                                <li key={k.id} className="py-3">
                                    <p className="text-[14px] font-medium text-heading">
                                        {k.route.ship.name}
                                    </p>
                                    <p className="text-[12px] text-body-subtle">
                                        {k.ticket_class.name} &middot; {k.date}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="text-[13px] text-body">
                                            Stok: {k.available_stock - k.sold_stock}/{k.available_stock}
                                        </span>
                                        {k.available_stock - k.sold_stock <= 5 && (
                                            <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700">
                                                Hampir habis
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-[14px] text-body">
                            Belum ada ketersediaan tiket.
                        </p>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
