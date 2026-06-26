import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

interface TicketClass {
    id: number;
    name: string;
    code: string;
}

interface TicketAvailability {
    id: number;
    ticket_class_id: number;
    date: string;
    price: number;
    available_stock: number;
    sold_stock: number;
    ticket_class: { id: number; name: string; code: string };
}

interface LegPort {
    id: number;
    name: string;
}

interface Leg {
    id: number;
    origin_port_id: number;
    destination_port_id: number;
    origin_port: LegPort;
    destination_port: LegPort;
    departure_time: string | null;
    arrival_time: string | null;
    route: {
        id: number;
        ticket_availabilities: TicketAvailability[];
    } | null;
}

interface Ship {
    id: number;
    name: string;
}

interface Sailing {
    id: number;
    name: string;
    departure_date: string;
    ship: Ship;
    legs: Leg[];
}

export default function Create({
    auth,
    sailings,
    ticketClasses,
}: {
    auth: { user: { id: number; name: string; email: string } };
    sailings: Sailing[];
    ticketClasses: TicketClass[];
}) {
    const [sailingId, setSailingId] = useState('');
    const [legId, setLegId] = useState('');
    const [ticketClassId, setTicketClassId] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [notes, setNotes] = useState('');

    const selectedSailing = sailings.find((s) => s.id === Number(sailingId));
    const selectedLeg = selectedSailing?.legs.find((l) => l.id === Number(legId));

    const availabilities = selectedLeg?.route?.ticket_availabilities ?? [];
    const filteredAvail = availabilities.filter((a) => a.ticket_class_id === Number(ticketClassId));
    const selectedAvail = filteredAvail[0];

    const canSubmit = sailingId && legId && ticketClassId && quantity && customerName && customerEmail && customerPhone;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!canSubmit) {
            return;
        }

        router.post('/admin/ticket-orders', {
            sailing_id: sailingId,
            sailing_leg_id: legId,
            ticket_class_id: ticketClassId,
            quantity: Number(quantity),
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            notes: notes || undefined,
        });
    };

    return (
        <AdminLayout
            auth={auth}
            title="Pemesanan Tiket Baru"
            subtitle="Buat pemesanan tiket untuk pelanggan"
        >
            <Head title="Pemesanan Tiket Baru" />

            <div className="mb-6">
                <Link
                    href="/admin/ticket-orders"
                    className="inline-flex items-center gap-1 text-[14px] font-medium text-body hover:text-heading"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
                <div className="card p-6">
                    <h3 className="mb-4 text-[16px] font-semibold text-heading">
                        Pilih Jadwal & Tiket
                    </h3>

                    <div className="mb-4">
                        <label className="mb-1 block text-[13px] font-medium text-heading">
                            Pelayaran
                        </label>
                        <select
                            value={sailingId}
                            onChange={(e) => {
                                setSailingId(e.target.value);
                                setLegId('');
                                setTicketClassId('');
                            }}
                            className="input h-10 w-full text-[14px]"
                            required
                        >
                            <option value="">Pilih pelayaran...</option>
                            {sailings.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({s.ship.name}) — {s.departure_date}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedSailing && (
                        <div className="mb-4">
                            <label className="mb-1 block text-[13px] font-medium text-heading">
                                Rute (Leg)
                            </label>
                            <select
                                value={legId}
                                onChange={(e) => {
                                    setLegId(e.target.value);
                                    setTicketClassId('');
                                }}
                                className="input h-10 w-full text-[14px]"
                                required
                            >
                                <option value="">Pilih rute...</option>
                                {selectedSailing.legs.map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.origin_port.name} → {l.destination_port.name}
                                        {l.departure_time ? ` (${l.departure_time})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {selectedLeg && (
                        <div className="mb-4">
                            <label className="mb-1 block text-[13px] font-medium text-heading">
                                Kelas Tiket
                            </label>
                            <select
                                value={ticketClassId}
                                onChange={(e) => setTicketClassId(e.target.value)}
                                className="input h-10 w-full text-[14px]"
                                required
                            >
                                <option value="">Pilih kelas...</option>
                                {ticketClasses.map((tc) => {
                                    const avail = availabilities.find((a) => a.ticket_class_id === tc.id);
                                    const remaining = avail ? avail.available_stock - avail.sold_stock : 0;

                                    return (
                                        <option key={tc.id} value={tc.id} disabled={remaining <= 0}>
                                            {tc.name} {avail ? `— Rp ${Number(avail.price).toLocaleString('id-ID')}` : ''}
                                            {remaining > 0 ? ` (sisa ${remaining})` : ' (habis)'}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}

                    {selectedAvail && (
                        <div className="mb-4">
                            <label className="mb-1 block text-[13px] font-medium text-heading">
                                Jumlah Tiket
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={Math.min(10, selectedAvail.available_stock - selectedAvail.sold_stock)}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="input h-10 w-24 text-[14px]"
                                required
                            />
                            <p className="mt-1 text-[12px] text-body-subtle">
                                Harga per tiket: Rp {Number(selectedAvail.price).toLocaleString('id-ID')}
                                {Number(quantity) > 0 && (
                                    <span className="ml-2 font-medium text-fg-brand">
                                        Total: Rp {(Number(selectedAvail.price) * Number(quantity)).toLocaleString('id-ID')}
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                </div>

                <div className="card mt-4 p-6">
                    <h3 className="mb-4 text-[16px] font-semibold text-heading">
                        Data Pelanggan
                    </h3>

                    <div className="mb-4">
                        <label className="mb-1 block text-[13px] font-medium text-heading">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="input h-10 w-full text-[14px]"
                            placeholder="Nama pelanggan"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="mb-1 block text-[13px] font-medium text-heading">
                            Email
                        </label>
                        <input
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="input h-10 w-full text-[14px]"
                            placeholder="email@example.com"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="mb-1 block text-[13px] font-medium text-heading">
                            Nomor Telepon
                        </label>
                        <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="input h-10 w-full text-[14px]"
                            placeholder="0812xxxxxxx"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="mb-1 block text-[13px] font-medium text-heading">
                            Catatan (opsional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="input h-20 w-full resize-none text-[14px]"
                            placeholder="Catatan tambahan..."
                        />
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="btn btn-brand h-10 px-6 disabled:opacity-50"
                    >
                        Pesan Tiket
                    </button>
                    <Link
                        href="/admin/ticket-orders"
                        className="text-[14px] font-medium text-body hover:text-heading"
                    >
                        Batal
                    </Link>
                </div>
            </form>
        </AdminLayout>
    );
}
