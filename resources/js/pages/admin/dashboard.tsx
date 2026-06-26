import { Head, Link } from '@inertiajs/react';
import { Bell, ShoppingCart } from 'lucide-react';
import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';
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

interface RealtimeOrder {
    booking_code: string;
    customer_name: string;
    total_price: number;
    origin?: string;
    destination?: string;
    ticket_class?: string;
    quantity: number;
}

interface RealtimeStock {
    ship_name: string;
    origin: string;
    destination: string;
    ticket_class: string;
    date: string;
    sold_stock: number;
    remaining: number;
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
    type NotificationItem = { id: number; message: string; time: string; type: 'order' | 'stock' };
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [showNotif, setShowNotif] = useState(false);

    useEffect(() => {
        let echo: {
            channel: (ch: string) => {
                listen: (event: string, callback: (data: unknown) => void) => void;
            };
            leaveChannel: (ch: string) => void;
        } | null = null;

        import('laravel-echo').then(({ default: Echo }) => {
            const win = window as unknown as Record<string, unknown>;

            if (typeof window !== 'undefined' && win.Echo) {
                echo = win.Echo as typeof echo;
            } else if (typeof window !== 'undefined') {
                const echoInstance = new Echo({
                    broadcaster: 'reverb',
                    Pusher,
                    key: import.meta.env.VITE_REVERB_APP_KEY,
                    wsHost: import.meta.env.VITE_REVERB_HOST,
                    wsPort: import.meta.env.VITE_REVERB_PORT,
                    wssPort: import.meta.env.VITE_REVERB_PORT,
                    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
                    enabledTransports: ['ws', 'wss'],
                });

                win.Echo = echoInstance;
                echo = echoInstance;
            }

            if (!echo) {
                return;
            }

            const ordersChannel = echo.channel('admin.ticket-orders');

            ordersChannel.listen('.ticket-order.created', (data: unknown) => {
                const d = data as { order: RealtimeOrder };
                const msg = `Pesanan baru: ${d.order.booking_code} — ${d.order.customer_name} (${d.order.origin ?? '?'} → ${d.order.destination ?? '?'})`;
                setNotifications((prev) => [{ id: Date.now(), message: msg, time: new Date().toLocaleTimeString('id-ID'), type: 'order' as const }, ...prev].slice(0, 20));
            });

            ordersChannel.listen('.ticket-order.status-changed', (data: unknown) => {
                const d = data as { bookingCode: string; newStatus: string };
                const statusLabel: Record<string, string> = { pending: 'Pending', paid: 'Dibayar', validated: 'Tervalidasi', cancelled: 'Dibatalkan' };
                const msg = `${d.bookingCode} → ${statusLabel[d.newStatus] ?? d.newStatus}`;
                setNotifications((prev) => [{ id: Date.now(), message: msg, time: new Date().toLocaleTimeString('id-ID'), type: 'order' as const }, ...prev].slice(0, 20));
            });

            const stockChannel = echo.channel('admin.ticket-stock');

            stockChannel.listen('.ticket-stock.updated', (data: unknown) => {
                const d = data as { stock: RealtimeStock };
                const msg = `Stok ${d.stock.ticket_class} ${d.stock.ship_name}: ${d.stock.origin}→${d.stock.destination} sisa ${d.stock.remaining}`;
                setNotifications((prev) => [{ id: Date.now(), message: msg, time: new Date().toLocaleTimeString('id-ID'), type: 'stock' as const }, ...prev].slice(0, 20));
            });
        });

        return () => {
            if (echo) {
                try {
                    echo.leaveChannel('admin.ticket-orders');
                    echo.leaveChannel('admin.ticket-stock');
                } catch {
                    // cleanup
                }
            }
        };
    }, []);

    return (
        <AdminLayout
            auth={auth}
            title="Dashboard"
            subtitle="Panel administrasi biwracean"
        >
            <Head title="Dashboard" />

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-[22px] font-bold text-heading">
                        Selamat datang, {auth.user.name}!
                    </h2>
                    <p className="mt-1 text-[14px] text-body">
                        Panel administrasi biwracean. Kelola data kapal, rute, dan pengaturan sistem di sini.
                    </p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowNotif(!showNotif)}
                        className="relative rounded-lg border border-border-default bg-neutral-primary-soft p-2.5 text-body hover:bg-neutral-secondary-medium hover:text-heading"
                    >
                        <Bell className="h-5 w-5" />
                        {notifications.length > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-fg-danger text-[11px] font-bold text-white">
                                {notifications.length > 9 ? '9+' : notifications.length}
                            </span>
                        )}
                    </button>

                    {showNotif && (
                        <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-lg border border-border-default bg-neutral-primary-bg shadow-xl">
                            <div className="border-b border-border-default px-4 py-3">
                                <h3 className="text-[14px] font-semibold text-heading">Notifikasi Real-time</h3>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <p className="px-4 py-6 text-center text-[13px] text-body-subtle">
                                        Belum ada notifikasi.
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-border-default">
                                        {notifications.map((n) => (
                                            <li key={n.id} className="flex items-start gap-3 px-4 py-3">
                                                <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] ${
                                                    n.type === 'order' ? 'bg-info-soft text-fg-info' : 'bg-success-soft text-fg-success'
                                                }`}>
                                                    <ShoppingCart className="h-3.5 w-3.5" />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[13px] text-body">{n.message}</p>
                                                    <p className="text-[11px] text-body-subtle">{n.time}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
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
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-[20px] font-semibold text-heading">
                            Ketersediaan Tiket Terbaru
                        </h3>
                        <Link
                            href="/admin/ticket-orders"
                            className="text-[13px] font-medium text-fg-brand underline underline-offset-2 hover:no-underline"
                        >
                            Lihat Penjualan
                        </Link>
                    </div>
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
