import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import NumberInput from '@/components/ui/NumberInput';
import AdminLayout from '@/layouts/AdminLayout';

interface TicketClass {
    id: number;
    uuid: string;
    name: string;
    code: string;
    description: string | null;
    type: string;
    seat_count: number;
    bedroom_count: number;
    facilities: string | null;
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface FormProps {
    auth: { user: AuthUser };
    ticketClass?: TicketClass;
}

export default function Form({ auth, ticketClass }: FormProps) {
    const isEditing = !!ticketClass;

    const { data, setData, post, patch, processing, errors } = useForm({
        name: ticketClass?.name ?? '',
        code: ticketClass?.code ?? '',
        description: ticketClass?.description ?? '',
        type: ticketClass?.type ?? 'seat',
        seat_count: ticketClass?.seat_count ?? '',
        bedroom_count: ticketClass?.bedroom_count ?? '',
        facilities: ticketClass?.facilities ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEditing) {
            patch(`/admin/ticket-classes/${ticketClass.uuid}`);
        } else {
            post('/admin/ticket-classes');
        }
    };

    return (
        <AdminLayout
            auth={auth}
            title={isEditing ? 'Edit Kelas Tiket' : 'Tambah Kelas Tiket'}
        >
            <Head title={isEditing ? 'Edit Kelas Tiket' : 'Tambah Kelas Tiket'} />

            <Link
                href="/admin/ticket-classes"
                className="mb-6 inline-flex items-center gap-1 text-[14px] font-medium text-fg-brand underline underline-offset-2 hover:no-underline"
            >
                &larr; Kembali
            </Link>

            <div className="card max-w-2xl p-6">
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="input-label">Nama</label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="input"
                            placeholder="Nama kelas tiket"
                        />
                        {errors.name && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="code" className="input-label">Kode</label>
                        <input
                            id="code"
                            type="text"
                            maxLength={10}
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            className="input"
                            placeholder="Contoh: VIP"
                        />
                        {errors.code && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.code}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="type" className="input-label">Tipe</label>
                        <select
                            id="type"
                            className="input"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                        >
                            <option value="seat">Kursi</option>
                            <option value="cabin">Kamar</option>
                        </select>
                        {errors.type && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.type}</p>
                        )}
                    </div>

                    {data.type === 'seat' && (
                        <NumberInput
                            label="Jumlah Kursi"
                            value={data.seat_count}
                            onChange={(v) => setData('seat_count', v)}
                            error={errors.seat_count}
                            placeholder="0"
                        />
                    )}

                    {data.type === 'cabin' && (
                        <NumberInput
                            label="Jumlah Kamar Tidur"
                            value={data.bedroom_count}
                            onChange={(v) => setData('bedroom_count', v)}
                            error={errors.bedroom_count}
                            placeholder="0"
                        />
                    )}

                    <div>
                        <label htmlFor="description" className="input-label">Deskripsi</label>
                        <textarea
                            id="description"
                            rows={4}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="input"
                            placeholder="Deskripsi kelas tiket (opsional)"
                        />
                        {errors.description && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.description}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="facilities" className="input-label">Fasilitas</label>
                        <textarea
                            id="facilities"
                            rows={4}
                            value={data.facilities}
                            onChange={(e) => setData('facilities', e.target.value)}
                            className="input"
                            placeholder="Pisahkan dengan newline"
                        />
                        {errors.facilities && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.facilities}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button type="submit" className="btn btn-brand" disabled={processing}>
                            {processing ? 'Menyimpan...' : isEditing ? 'Perbarui' : 'Simpan'}
                        </button>
                        <Link href="/admin/ticket-classes">
                            <span className="btn btn-white">Batal</span>
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
