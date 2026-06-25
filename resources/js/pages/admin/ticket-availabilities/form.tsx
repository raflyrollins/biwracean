import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import DatePicker from '@/components/ui/DatePicker';
import NumberInput from '@/components/ui/NumberInput';
import AdminLayout from '@/layouts/AdminLayout';

interface ShipTicketClass {
    id: number;
    ticket_class_id: number;
    seat_count: number | null;
    bedroom_count: number | null;
    ticket_class: { id: number; name: string };
}

interface Ship {
    id: number;
    name: string;
    ship_ticket_classes: ShipTicketClass[];
}

interface Route {
    id: number;
    uuid: string;
    ship: Ship;
    origin_port: { id: number; name: string };
    destination_port: { id: number; name: string };
}

interface TicketClass {
    id: number;
    uuid: string;
    name: string;
    code: string;
    type: string;
}

interface Availability {
    id: number;
    uuid: string;
    route_id: number;
    ticket_class_id: number;
    date: string;
    price: number;
    available_stock: number;
    sold_stock: number;
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface FormProps {
    auth: { user: AuthUser };
    availability?: Availability;
    routes: Route[];
    ticketClasses: TicketClass[];
}

export default function Form({ auth, availability, routes, ticketClasses }: FormProps) {
    const isEditing = !!availability;

    const { data, setData, post, patch, processing, errors } = useForm({
        route_id: availability?.route_id ?? '',
        ticket_class_id: availability?.ticket_class_id ?? '',
        date: availability?.date ?? '',
        price: availability?.price ?? '',
        available_stock: availability?.available_stock ?? '',
        sold_stock: availability?.sold_stock ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            patch(`/admin/ticket-availabilities/${availability.uuid}`);
        } else {
            post('/admin/ticket-availabilities');
        }
    };

    const selectedRoute = useMemo(
        () => routes.find((r) => r.id === Number(data.route_id)),
        [routes, data.route_id],
    );

    const selectedRouteTc = useMemo(() => {
        if (!selectedRoute) return null;

        return selectedRoute.ship.ship_ticket_classes.find(
            (stc) => stc.ticket_class_id === Number(data.ticket_class_id),
        );
    }, [selectedRoute, data.ticket_class_id]);

    useEffect(() => {
        if (selectedRouteTc && !isEditing) {
            const stock = selectedRouteTc.seat_count ?? selectedRouteTc.bedroom_count ?? '';
            setData('available_stock', stock);
        }
    }, [selectedRouteTc, isEditing]);

    return (
        <AdminLayout
            auth={auth}
            title={isEditing ? 'Edit Ketersediaan Tiket' : 'Tambah Ketersediaan Tiket'}
        >
            <Head title={isEditing ? 'Edit Ketersediaan Tiket' : 'Tambah Ketersediaan Tiket'} />

            <Link
                href="/admin/ticket-availabilities"
                className="mb-6 inline-flex items-center gap-1 text-[14px] font-medium text-fg-brand underline underline-offset-2 hover:no-underline"
            >
                &larr; Kembali
            </Link>

            <div className="card max-w-2xl p-6">
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label htmlFor="route_id" className="input-label">Rute</label>
                        <select
                            id="route_id"
                            value={data.route_id}
                            onChange={(e) => {
                                setData('route_id', e.target.value);
                                if (!isEditing) setData('available_stock', '');
                            }}
                            className="input"
                        >
                            <option value="">Pilih Rute</option>
                            {routes.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.ship.name} — {r.origin_port.name} &rarr; {r.destination_port.name}
                                </option>
                            ))}
                        </select>
                        {errors.route_id && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.route_id}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="ticket_class_id" className="input-label">Kelas Tiket</label>
                        <select
                            id="ticket_class_id"
                            value={data.ticket_class_id}
                            onChange={(e) => {
                                setData('ticket_class_id', e.target.value);
                                if (!isEditing) setData('available_stock', '');
                            }}
                            className="input"
                        >
                            <option value="">Pilih Kelas Tiket</option>
                            {ticketClasses.map((kt) => (
                                <option key={kt.id} value={kt.id}>
                                    {kt.name} ({kt.code})
                                </option>
                            ))}
                        </select>
                        {errors.ticket_class_id && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.ticket_class_id}</p>
                        )}
                    </div>

                    {selectedRouteTc && !isEditing && selectedRoute && (
                        <p className="text-[13px] text-body-subtle">
                            Stok dari konfigurasi kapal {selectedRoute.ship.name}:{' '}
                            {selectedRouteTc.seat_count ?? selectedRouteTc.bedroom_count ?? 'Tidak ditentukan'}
                        </p>
                    )}

                    <DatePicker
                        label="Tanggal"
                        value={data.date}
                        onChange={(v) => setData('date', v)}
                        error={errors.date}
                        min={isEditing ? undefined : new Date().toISOString().split('T')[0]}
                    />

                    <NumberInput
                        label="Harga"
                        value={data.price}
                        onChange={(v) => setData('price', v)}
                        error={errors.price}
                        placeholder="0"
                    />

                    <NumberInput
                        label="Stok Tersedia"
                        value={data.available_stock}
                        onChange={(v) => setData('available_stock', v)}
                        error={errors.available_stock}
                        placeholder="0"
                    />

                    {isEditing && (
                        <NumberInput
                            label="Stok Terjual"
                            value={data.sold_stock}
                            onChange={(v) => setData('sold_stock', v)}
                            error={errors.sold_stock}
                            placeholder="0"
                        />
                    )}

                    <div className="flex items-center gap-3">
                        <button type="submit" className="btn btn-brand" disabled={processing}>
                            {processing ? 'Menyimpan...' : isEditing ? 'Perbarui' : 'Simpan'}
                        </button>
                        <Link href="/admin/ticket-availabilities">
                            <span className="btn btn-white">Batal</span>
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
