import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import DatePicker from '@/components/ui/DatePicker';
import Pagination from '@/components/ui/Pagination';
import PerPageSelector from '@/components/ui/PerPageSelector';
import SearchInput from '@/components/ui/SearchInput';
import AdminLayout from '@/layouts/AdminLayout';

interface SailingLeg {
    id: number;
    origin_port_id: number;
    destination_port_id: number;
    originPort?: { id: number; name: string };
    destinationPort?: { id: number; name: string };
}

interface Sailing {
    id: number;
    uuid: string;
    name: string;
    departure_date: string;
}

interface TicketClass {
    id: number;
    name: string;
    code: string;
}

interface TicketOrder {
    id: number;
    uuid: string;
    booking_code: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    quantity: number;
    total_price: number;
    status: string;
    notes: string | null;
    created_at: string;
    sailing?: Sailing;
    sailing_leg?: SailingLeg;
    ticket_class?: TicketClass;
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
    status?: string;
    date_from?: string;
    date_to?: string;
}

const statusLabels: Record<string, string> = {
    pending: 'Pending',
    paid: 'Dibayar',
    validated: 'Tervalidasi',
    cancelled: 'Dibatalkan',
};

const statusColors: Record<string, string> = {
    pending: 'bg-warning-soft text-fg-warning',
    paid: 'bg-info-soft text-fg-info',
    validated: 'bg-success-soft text-fg-success',
    cancelled: 'bg-danger-soft text-fg-danger',
};

export default function Index({
    auth,
    orders,
    filters,
}: {
    auth: { user: AuthUser };
    orders: PaginatedData<TicketOrder>;
    filters: Filters;
}) {
    const [orderList, setOrderList] = useState(orders.data);
    const [actionTarget, setActionTarget] = useState<{ uuid: string; action: 'pay' | 'validate' | 'cancel'; label: string } | null>(null);

    useEffect(() => {
        let echo: { channel: (ch: string) => { listen: (event: string, callback: (data: unknown) => void) => void } } | null = null;

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

            const channel = echo.channel('admin.ticket-orders');

            channel.listen('.ticket-order.created', (data: unknown) => {
                const d = data as { order: TicketOrder };
                setOrderList((prev) => [d.order, ...prev]);
            });

            channel.listen('.ticket-order.status-changed', (data: unknown) => {
                const d = data as { uuid: string; newStatus: string };
                setOrderList((prev) =>
                    prev.map((o) =>
                        o.uuid === d.uuid ? { ...o, status: d.newStatus } : o,
                    ),
                );
            });
        });

        return () => {
            if (echo) {
                try {
                    echo.channel('admin.ticket-orders');
                } catch {
                    // cleanup
                }
            }
        };
    }, []);

    const applyFilter = (key: string, value: string | number | undefined) => {
        const params = new URLSearchParams(window.location.search);

        if (value === undefined || value === '' || value === null) {
            params.delete(key);
        } else {
            params.set(key, String(value));
        }

        params.delete('page');
        router.get(`/admin/ticket-orders?${params.toString()}`);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    };

    const actionMessages: Record<string, { title: string; message: (label: string) => string; confirmLabel: string; variant: 'danger' | 'warning' | 'success' }> = {
        pay: {
            title: 'Konfirmasi Pembayaran',
            message: (label) => `Konfirmasi pembayaran tiket "${label}"?\n\nPembayaran akan mengurangi stok tiket yang tersedia.`,
            confirmLabel: 'Ya, Bayar',
            variant: 'warning',
        },
        validate: {
            title: 'Validasi Tiket',
            message: (label) => `Validasi tiket "${label}"?\n\nTiket akan ditandai sebagai tervalidasi dan siap digunakan.`,
            confirmLabel: 'Ya, Validasi',
            variant: 'success',
        },
        cancel: {
            title: 'Batalkan Tiket',
            message: (label) => `Batalkan tiket "${label}"?\n\nTiket yang sudah dibayar akan mengembalikan stok.`,
            confirmLabel: 'Ya, Batalkan',
            variant: 'danger',
        },
    };

    return (
        <AdminLayout auth={auth} title="Penjualan Tiket">
            <Head title="Penjualan Tiket" />

            <ConfirmModal
                open={!!actionTarget}
                title={actionTarget ? actionMessages[actionTarget.action].title : ''}
                message={actionTarget ? actionMessages[actionTarget.action].message(actionTarget.label) : ''}
                confirmLabel={actionTarget ? actionMessages[actionTarget.action].confirmLabel : ''}
                variant={actionTarget ? actionMessages[actionTarget.action].variant : 'danger'}
                onConfirm={() => {
                    if (actionTarget) {
                        router.post(`/admin/ticket-orders/${actionTarget.uuid}/${actionTarget.action}`);
                        setActionTarget(null);
                    }
                }}
                onCancel={() => setActionTarget(null)}
            />

            <div className="mb-6 flex items-center justify-between">
                <p className="text-[14px] text-body">
                    Daftar pemesanan tiket pelanggan.
                </p>
                <Link
                    href="/admin/ticket-orders/create"
                    className="btn btn-brand inline-flex items-center gap-2 h-9 px-4 text-[13px]"
                >
                    <Plus className="h-4 w-4" />
                    Buat Pesanan Baru
                </Link>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <SearchInput
                    value={filters.search ?? ''}
                    onChange={(v) => applyFilter('search', v || undefined)}
                    placeholder="Cari kode booking, nama, atau email..."
                />

                <select
                    value={filters.status ?? ''}
                    onChange={(e) => applyFilter('status', e.target.value || undefined)}
                    className="input h-9 w-40 text-[13px]"
                >
                    <option value="">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Dibayar</option>
                    <option value="validated">Tervalidasi</option>
                    <option value="cancelled">Dibatalkan</option>
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
                        value={filters.per_page ?? orders.per_page}
                        onChange={(v) => applyFilter('per_page', v)}
                    />
                </div>
            </div>

            <div className="card overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-border-default bg-neutral-secondary-soft">
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Kode Booking</th>
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Customer</th>
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Rute</th>
                            <th className="px-4 py-3 text-left text-[13px] font-semibold text-heading">Kelas</th>
                            <th className="px-4 py-3 text-right text-[13px] font-semibold text-heading">Qty</th>
                            <th className="px-4 py-3 text-right text-[13px] font-semibold text-heading">Total</th>
                            <th className="px-4 py-3 text-center text-[13px] font-semibold text-heading">Status</th>
                            <th className="px-4 py-3 text-right text-[13px] font-semibold text-heading">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderList.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-[14px] text-body">
                                    Belum ada pemesanan tiket.
                                </td>
                            </tr>
                        ) : (
                            orderList.map((order) => {
                                const routeName = order.sailing_leg
                                    ? `${order.sailing_leg.originPort?.name ?? '?'} → ${order.sailing_leg.destinationPort?.name ?? '?'}`
                                    : '—';
                                const canPay = order.status === 'pending';
                                const canValidate = order.status === 'paid';
                                const canCancel = order.status === 'pending' || order.status === 'paid';

                                return (
                                    <tr key={order.id} className="border-b border-border-default last:border-b-0">
                                        <td className="px-4 py-3">
                                            <div className="text-[14px] font-medium text-heading">{order.booking_code}</div>
                                            {order.sailing && (
                                                <div className="text-[12px] text-body-subtle">{order.sailing.name} ({order.sailing.departure_date})</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-[14px] text-heading">{order.customer_name}</div>
                                            <div className="text-[12px] text-body-subtle">{order.customer_email}</div>
                                        </td>
                                        <td className="px-4 py-3 text-[14px] text-body">{routeName}</td>
                                        <td className="px-4 py-3 text-[14px] text-body">{order.ticket_class?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-right text-[14px] text-body">{order.quantity}</td>
                                        <td className="px-4 py-3 text-right text-[14px] text-body">{formatPrice(order.total_price)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block rounded-full px-2 py-0.5 text-[13px] font-medium ${statusColors[order.status] ?? ''}`}>
                                                {statusLabels[order.status] ?? order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {canPay && (
                                                    <button
                                                        onClick={() => setActionTarget({ uuid: order.uuid, action: 'pay', label: order.booking_code })}
                                                        className="text-[13px] font-medium text-fg-info underline underline-offset-2 hover:no-underline"
                                                    >
                                                        Bayar
                                                    </button>
                                                )}
                                                {canValidate && (
                                                    <button
                                                        onClick={() => setActionTarget({ uuid: order.uuid, action: 'validate', label: order.booking_code })}
                                                        className="text-[13px] font-medium text-fg-success underline underline-offset-2 hover:no-underline"
                                                    >
                                                        Validasi
                                                    </button>
                                                )}
                                                {canCancel && (
                                                    <button
                                                        onClick={() => setActionTarget({ uuid: order.uuid, action: 'cancel', label: order.booking_code })}
                                                        className="text-[13px] font-medium text-fg-danger underline underline-offset-2 hover:no-underline"
                                                    >
                                                        Batalkan
                                                    </button>
                                                )}
                                                {!canPay && !canValidate && !canCancel && (
                                                    <span className="text-[13px] text-body-subtle">—</span>
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

            <Pagination links={orders.links} from={orders.from} to={orders.to} total={orders.total} />
        </AdminLayout>
    );
}
