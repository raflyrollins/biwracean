import { Head, Link, useForm } from '@inertiajs/react';
import NumberInput from '@/components/ui/NumberInput';
import AdminLayout from '@/layouts/AdminLayout';

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface Option {
    id: number;
    uuid: string;
    name: string;
}

interface Route {
    id: number;
    uuid: string;
    ship_id: number;
    origin_port_id: number;
    destination_port_id: number;
    base_price: number;
    status: string;
}

export default function RouteForm({
    auth,
    ships,
    ports,
    route,
}: {
    auth: { user: AuthUser };
    ships: Option[];
    ports: Option[];
    route?: Route;
}) {
    const isEditing = !!route;

    const { data, setData, post, put, processing, errors } = useForm({
        ship_id: route?.ship_id ?? '',
        origin_port_id: route?.origin_port_id ?? '',
        destination_port_id: route?.destination_port_id ?? '',
        base_price: route?.base_price ?? '',
        status: route?.status ?? 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/admin/routes/${route.uuid}`);
        } else {
            post('/admin/routes');
        }
    };

    return (
        <AdminLayout
            auth={auth}
            title={isEditing ? 'Edit Rute' : 'Tambah Rute'}
            subtitle={isEditing ? 'Edit data rute' : 'Masukkan data rute baru'}
        >
            <Head title={isEditing ? 'Edit Rute' : 'Tambah Rute'} />

            <div className="card mx-auto max-w-2xl p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="ship_id" className="input-label">
                            Kapal
                        </label>
                        <select
                            id="ship_id"
                            className="input"
                            value={data.ship_id}
                            onChange={(e) => setData('ship_id', e.target.value)}
                        >
                            <option value="">Pilih Kapal</option>
                            {ships.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        {errors.ship_id && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.ship_id}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="origin_port_id" className="input-label">
                            Pelabuhan Asal
                        </label>
                        <select
                            id="origin_port_id"
                            className="input"
                            value={data.origin_port_id}
                            onChange={(e) => setData('origin_port_id', e.target.value)}
                        >
                            <option value="">Pilih Pelabuhan Asal</option>
                            {ports.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        {errors.origin_port_id && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.origin_port_id}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="destination_port_id" className="input-label">
                            Pelabuhan Tujuan
                        </label>
                        <select
                            id="destination_port_id"
                            className="input"
                            value={data.destination_port_id}
                            onChange={(e) => setData('destination_port_id', e.target.value)}
                        >
                            <option value="">Pilih Pelabuhan Tujuan</option>
                            {ports.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        {errors.destination_port_id && (
                            <p className="mt-1 text-[12px] text-fg-danger">{errors.destination_port_id}</p>
                        )}
                    </div>

                    <NumberInput
                        label="Harga Dasar"
                        value={data.base_price}
                        onChange={(v) => setData('base_price', v)}
                        error={errors.base_price}
                        placeholder="0"
                    />

                    <div>
                        <label htmlFor="status" className="input-label">
                            Status
                        </label>
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
                        <Link href="/admin/routes" className="btn btn-white">
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
