import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import NumberInput from '@/components/ui/NumberInput';
import AdminLayout from '@/layouts/AdminLayout';

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface TicketClass {
    id: number;
    name: string;
    code: string;
    type: string;
    description: string | null;
}

interface ShipTicketClass {
    id: number;
    ticket_class_id: number;
    seat_count: number | null;
    bedroom_count: number | null;
    ticket_class: TicketClass;
}

interface Ship {
    id: number;
    uuid: string;
    name: string;
    hull_number: string;
    capacity: number;
    ship_type: string;
    description: string;
    status: string;
    ship_ticket_classes: ShipTicketClass[];
}

interface ClassConfig {
    ticket_class_id: number;
    seat_count: string | number;
    bedroom_count: string | number;
}

function buildInitialConfigs(ship?: Ship): ClassConfig[] {
    if (!ship?.ship_ticket_classes) return [];

    return ship.ship_ticket_classes.map((stc) => ({
        ticket_class_id: stc.ticket_class_id,
        seat_count: stc.seat_count ?? '',
        bedroom_count: stc.bedroom_count ?? '',
    }));
}

export default function ShipForm({
    auth,
    ship,
    ticketClasses,
}: {
    auth: { user: AuthUser };
    ship?: Ship;
    ticketClasses: TicketClass[];
}) {
    const isEditing = !!ship;

    const { data, setData, post, put, processing, errors } = useForm({
        name: ship?.name ?? '',
        hull_number: ship?.hull_number ?? '',
        capacity: ship?.capacity ?? '',
        ship_type: ship?.ship_type ?? 'passenger',
        description: ship?.description ?? '',
        status: ship?.status ?? 'active',
        class_configs: buildInitialConfigs(ship),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/ships/${ship.uuid}`);
        } else {
            post('/admin/ships');
        }
    };

    const toggleClass = (tc: TicketClass) => {
        const exists = data.class_configs.find((c) => c.ticket_class_id === tc.id);

        if (exists) {
            setData(
                'class_configs',
                data.class_configs.filter((c) => c.ticket_class_id !== tc.id),
            );
        } else {
            setData('class_configs', [
                ...data.class_configs,
                {
                    ticket_class_id: tc.id,
                    seat_count: '',
                    bedroom_count: '',
                },
            ]);
        }
    };

    const updateConfig = (ticketClassId: number, field: string, value: string | number) => {
        setData(
            'class_configs',
            data.class_configs.map((c) =>
                c.ticket_class_id === ticketClassId ? { ...c, [field]: value } : c,
            ),
        );
    };

    const isSelected = (tcId: number) => data.class_configs.some((c) => c.ticket_class_id === tcId);
    const getConfig = (tcId: number) => data.class_configs.find((c) => c.ticket_class_id === tcId);

    return (
        <AdminLayout
            auth={auth}
            title={isEditing ? 'Edit Kapal' : 'Tambah Kapal'}
            subtitle={isEditing ? `Edit data kapal "${ship.name}"` : 'Masukkan data kapal baru'}
        >
            <Head title={isEditing ? 'Edit Kapal' : 'Tambah Kapal'} />

            <div className="mx-auto max-w-2xl space-y-6">
                <div className="card p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="input-label">Nama Kapal</label>
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
                            <label htmlFor="hull_number" className="input-label">Nomor Lambung</label>
                            <input
                                id="hull_number"
                                type="text"
                                className="input"
                                value={data.hull_number}
                                onChange={(e) => setData('hull_number', e.target.value)}
                            />
                            {errors.hull_number && (
                                <p className="mt-1 text-[12px] text-fg-danger">{errors.hull_number}</p>
                            )}
                        </div>

                        <NumberInput
                            label="Kapasitas"
                            value={data.capacity}
                            onChange={(v) => setData('capacity', v)}
                            error={errors.capacity}
                            placeholder="0"
                        />

                        <div>
                            <label htmlFor="ship_type" className="input-label">Tipe Kapal</label>
                            <select
                                id="ship_type"
                                className="input"
                                value={data.ship_type}
                                onChange={(e) => setData('ship_type', e.target.value)}
                            >
                                <option value="passenger">Angkutan Orang</option>
                                <option value="cargo">Angkutan Barang</option>
                                <option value="vehicle_ferry">Penyeberangan Kendaraan</option>
                                <option value="mixed">Campuran</option>
                            </select>
                            {errors.ship_type && (
                                <p className="mt-1 text-[12px] text-fg-danger">{errors.ship_type}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="description" className="input-label">Deskripsi</label>
                            <textarea
                                id="description"
                                className="input min-h-[100px]"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            {errors.description && (
                                <p className="mt-1 text-[12px] text-fg-danger">{errors.description}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="status" className="input-label">Status</label>
                            <select
                                id="status"
                                className="input"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                            {errors.status && (
                                <p className="mt-1 text-[12px] text-fg-danger">{errors.status}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button type="submit" className="btn btn-brand" disabled={processing}>
                                {processing ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan'}
                            </button>
                            <Link href="/admin/ships" className="btn btn-white">Batal</Link>
                        </div>
                    </form>
                </div>

                <div className="card p-6">
                    <h3 className="mb-1 text-[16px] font-semibold text-heading">
                        Konfigurasi Kelas Tiket
                    </h3>
                    <p className="mb-4 text-[13px] text-body-subtle">
                        Atur jumlah kursi/kamar untuk setiap kelas tiket di kapal ini.
                    </p>

                    {ticketClasses.length === 0 ? (
                        <p className="text-[14px] text-body">Belum ada kelas tiket.</p>
                    ) : (
                        <div className="divide-y divide-border-default">
                            {ticketClasses.map((tc) => {
                                const selected = isSelected(tc.id);
                                const config = getConfig(tc.id);

                                return (
                                    <div key={tc.id} className="flex items-start gap-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id={`tc-${tc.id}`}
                                                checked={selected}
                                                onChange={() => toggleClass(tc)}
                                                className="mt-1 h-4 w-4 accent-brand"
                                            />
                                            <label htmlFor={`tc-${tc.id}`} className="cursor-pointer">
                                                <p className="text-[14px] font-medium text-heading">
                                                    {tc.name}
                                                </p>
                                                <p className="text-[12px] text-body-subtle">
                                                    {tc.code} &middot; {tc.type === 'seat' ? 'Kursi' : 'Kamar'}
                                                </p>
                                            </label>
                                        </div>

                                        {selected && (
                                            <div className="ml-auto flex items-center gap-3">
                                                {tc.type === 'seat' && (
                                                    <div>
                                                        <span className="input-label">Jumlah Kursi</span>
                                                        <input
                                                            type="text"
                                                            className="input w-24"
                                                            value={config?.seat_count ?? ''}
                                                            placeholder="0"
                                                            onInput={(e) => {
                                                                const el = e.currentTarget;
                                                                el.value = el.value.replace(/\D/g, '');
                                                            }}
                                                            onChange={(e) =>
                                                                updateConfig(tc.id, 'seat_count', e.target.value)
                                                            }
                                                        />
                                                    </div>
                                                )}
                                                {tc.type === 'cabin' && (
                                                    <div>
                                                        <span className="input-label">Jumlah Kamar</span>
                                                        <input
                                                            type="text"
                                                            className="input w-24"
                                                            value={config?.bedroom_count ?? ''}
                                                            placeholder="0"
                                                            onInput={(e) => {
                                                                const el = e.currentTarget;
                                                                el.value = el.value.replace(/\D/g, '');
                                                            }}
                                                            onChange={(e) =>
                                                                updateConfig(tc.id, 'bedroom_count', e.target.value)
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {errors.class_configs && (
                        <p className="mt-2 text-[12px] text-fg-danger">{errors.class_configs}</p>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
