import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import DatePicker from '@/components/ui/DatePicker';
import TimePicker from '@/components/ui/TimePicker';
import AdminLayout from '@/layouts/AdminLayout';

interface Port {
    id: number;
    name: string;
    code: string;
}

interface Ship {
    id: number;
    name: string;
    hull_number: string;
}

interface SailingLeg {
    id: number;
    leg_order: number;
    origin_port_id: number;
    destination_port_id: number;
    departure_time: string | null;
    arrival_time: string | null;
}

interface Sailing {
    uuid: string;
    name: string;
    ship_id: number;
    departure_date: string;
    arrival_date: string | null;
    status: string;
    legs: SailingLeg[];
}

export default function SailingForm({
    auth,
    sailing,
    ships,
    ports,
}: {
    auth: { user: { id: number; name: string; email: string } };
    sailing?: Sailing;
    ships: Ship[];
    ports: Port[];
}) {
    const isEditing = !!sailing;

    const buildPortIds = () => {
        if (!sailing?.legs?.length) return [''];

        const sorted = [...sailing.legs].sort((a, b) => a.leg_order - b.leg_order);
        const ids: string[] = [];
        for (const leg of sorted) {
            if (ids.length === 0) ids.push(String(leg.origin_port_id));
            ids.push(String(leg.destination_port_id));
        }
        return ids;
    };

    const buildDepartureTimes = () => {
        if (!sailing?.legs?.length) return [];
        return [...sailing.legs]
            .sort((a, b) => a.leg_order - b.leg_order)
            .map((l) => l.departure_time ?? '');
    };

    const buildArrivalTimes = () => {
        if (!sailing?.legs?.length) return [];
        return [...sailing.legs]
            .sort((a, b) => a.leg_order - b.leg_order)
            .map((l) => l.arrival_time ?? '');
    };

    const { data, setData, post, put, processing, errors } = useForm({
        ship_id: sailing?.ship_id ?? '',
        name: sailing?.name ?? '',
        departure_date: sailing?.departure_date ?? '',
        arrival_date: sailing?.arrival_date ?? '',
        status: sailing?.status ?? 'scheduled',
        port_ids: buildPortIds(),
        departure_times: buildDepartureTimes(),
        arrival_times: buildArrivalTimes(),
    });

    const legCount = data.port_ids.length - 1;

    const addPort = () => {
        setData('port_ids', [...data.port_ids, '']);
        setData('departure_times', [...data.departure_times, '']);
        setData('arrival_times', [...data.arrival_times, '']);
    };

    const removePort = (index: number) => {
        if (data.port_ids.length <= 2) return;
        const newIds = data.port_ids.filter((_, i) => i !== index);
        const newDep = data.departure_times.filter((_, i) => i !== index && i < newIds.length - 1);
        const newArr = data.arrival_times.filter((_, i) => i !== index && i < newIds.length - 1);
        setData('port_ids', newIds);
        setData('departure_times', newDep);
        setData('arrival_times', newArr);
    };

    const updatePortId = (index: number, value: string) => {
        const newPortIds = [...data.port_ids];
        newPortIds[index] = value;
        setData('port_ids', newPortIds);
    };

    const updateDepartureTime = (legIdx: number, value: string) => {
        const newTimes = [...data.departure_times];
        newTimes[legIdx] = value;
        setData('departure_times', newTimes);
    };

    const updateArrivalTime = (legIdx: number, value: string) => {
        const newTimes = [...data.arrival_times];
        newTimes[legIdx] = value;
        setData('arrival_times', newTimes);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/sailings/${sailing.uuid}`);
        } else {
            post('/admin/sailings');
        }
    };

    const getPortName = (id: string) => {
        const port = ports.find((p) => p.id === Number(id));
        return port ? `${port.name} (${port.code})` : '';
    };

    return (
        <AdminLayout
            auth={auth}
            title={isEditing ? 'Edit Pelayaran' : 'Tambah Pelayaran'}
        >
            <Head title={isEditing ? 'Edit Pelayaran' : 'Tambah Pelayaran'} />

            <Link
                href="/admin/sailings"
                className="mb-6 inline-flex items-center gap-1 text-[14px] font-medium text-fg-brand underline underline-offset-2 hover:no-underline"
            >
                &larr; Kembali
            </Link>

            <div className="card max-w-3xl p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="input-label">Nama Pelayaran</label>
                        <input
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
                        <label className="input-label">Kapal</label>
                        <select
                            className="input"
                            value={data.ship_id}
                            onChange={(e) => setData('ship_id', e.target.value)}
                        >
                            <option value="">Pilih Kapal</option>
                            {ships.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({s.hull_number})
                                </option>
                            ))}
                        </select>
                        {errors.ship_id && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.ship_id}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <DatePicker
                            label="Tanggal Berangkat"
                            value={data.departure_date}
                            onChange={(v) => setData('departure_date', v)}
                            error={errors.departure_date}
                        />
                        <DatePicker
                            label="Tanggal Tiba (opsional)"
                            value={data.arrival_date}
                            onChange={(v) => setData('arrival_date', v)}
                            error={errors.arrival_date}
                        />
                    </div>

                    <div>
                        <label className="input-label">Status</label>
                        <select
                            className="input"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            <option value="scheduled">Terjadwal</option>
                            <option value="in_progress">Sedang Berlayar</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                        </select>
                        {errors.status && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.status}</p>
                        )}
                    </div>

                    <div className="border-t border-border-default pt-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-[16px] font-semibold text-heading">Rute Pelayaran</h3>
                                <p className="text-[13px] text-body-subtle">
                                    Tambah pelabuhan secara berurutan dari awal sampai akhir.
                                    {legCount > 0 && (
                                        <span className="ml-1">
                                            ({legCount} leg{legCount > 1 ? 's' : ''} akan dibuat)
                                        </span>
                                    )}
                                </p>
                            </div>
                            <button type="button" onClick={addPort} className="btn btn-white text-[13px]">
                                + Tambah Pelabuhan
                            </button>
                        </div>

                        <div className="space-y-3">
                            {data.port_ids.map((portId, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="flex w-8 shrink-0 flex-col items-center pt-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-[12px] font-bold text-fg-brand">
                                            {idx + 1}
                                        </div>
                                        {idx < data.port_ids.length - 1 && (
                                            <div className="mt-1 h-6 w-0.5 bg-border-default" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <label className="input-label">
                                            {idx === 0 ? 'Pelabuhan Asal' : idx === data.port_ids.length - 1 ? 'Pelabuhan Tujuan Akhir' : `Pelabuhan Singgah ${idx}`}
                                        </label>
                                        <select
                                            className="input"
                                            value={portId}
                                            onChange={(e) => updatePortId(idx, e.target.value)}
                                        >
                                            <option value="">Pilih Pelabuhan</option>
                                            {ports.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} ({p.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {idx < data.port_ids.length - 1 && (
                                        <div className="flex shrink-0 gap-2 pt-5">
                                            <TimePicker
                                                label="Berangkat"
                                                value={data.departure_times[idx] ?? ''}
                                                onChange={(v) => updateDepartureTime(idx, v)}
                                            />
                                            <TimePicker
                                                label="Tiba"
                                                value={data.arrival_times[idx] ?? ''}
                                                onChange={(v) => updateArrivalTime(idx, v)}
                                            />
                                        </div>
                                    )}

                                    {data.port_ids.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removePort(idx)}
                                            className="mt-6 shrink-0 text-[18px] text-fg-danger hover:text-fg-danger-strong"
                                            title="Hapus"
                                        >
                                            &times;
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {errors.port_ids && (
                            <p className="mt-2 text-[12px] text-fg-danger">{errors.port_ids}</p>
                        )}

                        {legCount > 0 && (
                            <div className="mt-4 rounded-lg bg-neutral-secondary-soft p-3">
                                <p className="mb-2 text-[12px] font-medium text-heading">Pratinjau Leg:</p>
                                <ul className="space-y-1">
                                    {Array.from({ length: legCount }).map((_, i) => (
                                        <li key={i} className="text-[13px] text-body">
                                            Leg {i + 1}:{' '}
                                            <span className="font-medium text-heading">
                                                {getPortName(data.port_ids[i])}
                                            </span>{' '}
                                            &rarr;{' '}
                                            <span className="font-medium text-heading">
                                                {getPortName(data.port_ids[i + 1])}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button type="submit" className="btn btn-brand" disabled={processing}>
                            {processing ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan'}
                        </button>
                        <Link href="/admin/sailings">
                            <span className="btn btn-white">Batal</span>
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
