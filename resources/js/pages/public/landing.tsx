import { Head } from '@inertiajs/react';
import {
    Anchor,
    Ship,
    Truck,
    Package,
    Ticket,
    MapPin,
    Phone,
    Mail,
    ArrowRight,
    ShieldCheck,
    Clock,
    HeartHandshake,
} from 'lucide-react';
import type { ReactNode } from 'react';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import PublicLayout from '@/layouts/PublicLayout';
import useInView from '@/lib/useInView';

const services = [
    {
        icon: Ship,
        title: 'Ferry Penumpang',
        desc: 'Layanan penyeberangan reguler dengan armada feri modern dan nyaman.',
        img: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&q=80',
    },
    {
        icon: Truck,
        title: 'Angkutan Kendaraan',
        desc: 'Pengangkutan kendaraan roda dua, roda empat, hingga truk lintas pelabuhan.',
        img: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=600&q=80',
    },
    {
        icon: Package,
        title: 'Kargo & Logistik',
        desc: 'Layanan pengiriman barang dan logistik dengan jadwal tepat waktu.',
        img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80',
    },
    {
        icon: Ticket,
        title: 'Pemesanan Tiket',
        desc: 'Pemesanan tiket secara online (tersedia di platform terpisah).',
        img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
    },
];

const aboutItems = [
    {
        icon: ShieldCheck,
        title: 'Visi',
        desc: 'Menjadi perusahaan transportasi laut terdepan yang menghubungkan Nusantara dengan pelayanan prima dan teknologi modern.',
    },
    {
        icon: Clock,
        title: 'Misi',
        desc: 'Menyediakan layanan transportasi laut yang aman, tepat waktu, dan terjangkau dengan mengutamakan keselamatan dan kenyamanan penumpang.',
    },
    {
        icon: HeartHandshake,
        title: 'Nilai',
        desc: 'Keselamatan, integritas, inovasi, dan pelayanan terbaik adalah fondasi setiap langkah kami dalam melayani pelanggan.',
    },
];

const stats = [
    { label: 'Armada Kapal', value: '12+' },
    { label: 'Rute Aktif', value: '8' },
    { label: 'Pelabuhan', value: '6' },
    { label: 'Penumpang per Tahun', value: '500rb+' },
];

const contacts = [
    { icon: MapPin, label: 'Alamat', value: 'Jl. Pelabuhan No. 1, Jakarta Utara' },
    { icon: Phone, label: 'Telepon', value: '+62 21 1234 5678' },
    { icon: Mail, label: 'Email', value: 'info@biwracean.com' },
];

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
    const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${
                inView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            } ${className}`}
        >
            {children}
        </div>
    );
}

export default function Landing() {
    return (
        <PublicLayout>
            <Head title="biwracean - Solusi Transportasi Laut Terpercaya" />

            {/* ============ HERO ============ */}
            <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-gradient-to-br from-brand via-[#7C4DFF] to-[#5B4DFF]">
                <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-white/[0.04]" />
                <div className="pointer-events-none absolute right-1/4 top-1/3 h-48 w-48 rounded-full bg-[#00AAFF]/10" />

                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{
                        backgroundImage:
                            'url(https://images.unsplash.com/photo-1509475826633-fed577a2c71b?w=1920&q=80)',
                    }}
                />

                <div className="section-container relative z-10 w-full pt-24">
                    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                        <div className="text-center lg:text-left">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-on-brand/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-on-brand-muted">
                                <Anchor className="h-3.5 w-3.5" />
                                Solusi Transportasi Laut Terpercaya
                            </div>
                            <h1 className="text-on-brand mb-4 lg:mb-6">
                                Selamat Datang di biwracean
                            </h1>
                            <p className="mx-auto max-w-xl text-[18px] leading-[1.7] text-on-brand-muted/90 lg:mx-0">
                                Perusahaan transportasi laut terpercaya yang melayani rute
                                antar-pelabuhan di seluruh Nusantara. Kami berkomitmen
                                memberikan pengalaman perjalanan laut yang aman, nyaman, dan
                                tepat waktu.
                            </p>
                            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                                <a href="#about">
                                    <Button variant="white" className="gap-2">
                                        Pelajari Lebih Lanjut
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </a>
                                <a
                                    href="#contact"
                                    className="btn text-on-brand-muted/80 hover:text-on-brand !px-6"
                                >
                                    Hubungi Kami
                                </a>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <div className="relative">
                                <div className="absolute -inset-4 rounded-none bg-gradient-to-tr from-[#00AAFF]/20 to-transparent blur-xl" />
                                <img
                                    src="https://images.unsplash.com/photo-1552308995-2baac1ad5490?w=800&q=80"
                                    alt="Kapal ferry biwracean"
                                    className="relative w-full rounded-none object-cover shadow-2xl"
                                    style={{ aspectRatio: '4/3' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ ABOUT ============ */}
            <Reveal>
            <section
                id="about"
                className="relative overflow-hidden bg-gradient-to-b from-brand to-brand-strong"
            >
                <div className="section-container section-padding">
                    <div className="mb-12 text-center md:mb-16">
                        <h2 className="text-on-brand">Tentang biwracean</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-[1.7] text-on-brand-muted">
                            Mitra terpercaya Anda dalam transportasi laut
                        </p>
                    </div>

                    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                        <div className="relative">
                            <div className="absolute -inset-4 rounded-none bg-gradient-to-tr from-brand-soft/20 to-transparent blur-xl" />
                            <img
                                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"
                                alt="Pelabuhan biwracean"
                                className="relative w-full rounded-none object-cover shadow-2xl"
                                style={{ aspectRatio: '4/3' }}
                            />
                        </div>

                        <div className="space-y-6">
                            {aboutItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.title}
                                        className="card !shadow-md flex items-start gap-5 p-6"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-brand-softer">
                                            <Icon className="h-6 w-6 text-fg-brand-strong" />
                                        </div>
                                        <div>
                                            <h3 className="text-[18px] font-semibold text-heading">
                                                {item.title}
                                            </h3>
                                            <p className="mt-1 text-[14px] leading-[1.7] text-body">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
            </Reveal>

            {/* ============ SERVICES ============ */}
            <Reveal>
            <section
                id="services"
                className="relative overflow-hidden bg-gradient-to-b from-brand-strong via-brand to-[#5B4DFF]"
            >
                <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#00AAFF]/8" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#00CC88]/8" />

                <div className="section-container section-padding">
                    <div className="mb-12 text-center md:mb-16">
                        <h2 className="text-on-brand">Layanan Kami</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-[1.7] text-on-brand-muted">
                            Berbagai layanan untuk memenuhi kebutuhan transportasi laut Anda
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-8">
                        {services.map((s) => {
                            const Icon = s.icon;

                            return (
                                <div
                                    key={s.title}
                                    className="card !shadow-md overflow-hidden"
                                >
                                    <div
                                        className="h-40 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${s.img})` }}
                                    />
                                    <div className="p-6">
                                        <div className="mb-4 flex h-10 w-10 items-center justify-center bg-brand-softer">
                                            <Icon className="h-5 w-5 text-fg-brand-strong" />
                                        </div>
                                        <h3 className="text-[18px] font-semibold text-heading">
                                            {s.title}
                                        </h3>
                                        <p className="mt-1.5 text-[14px] leading-[1.7] text-body">
                                            {s.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
            </Reveal>

            {/* ============ STATS ============ */}
            <Reveal>
            <section className="relative overflow-hidden bg-gradient-to-r from-[#5B4DFF] via-brand to-[#7C4DFF]">
                <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5" />

                <div className="section-container section-padding">
                    <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <StatCard key={stat.label} label={stat.label} value={stat.value} />
                        ))}
                    </div>
                </div>
            </section>
            </Reveal>

            {/* ============ CONTACT ============ */}
            <Reveal>
            <section
                id="contact"
                className="relative overflow-hidden bg-gradient-to-b from-[#5B4DFF] via-brand to-brand-strong"
            >
                <div className="section-container section-padding">
                    <div className="mb-12 text-center md:mb-16">
                        <h2 className="text-on-brand">Hubungi Kami</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-[1.7] text-on-brand-muted">
                            Silakan hubungi kami untuk informasi lebih lanjut
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
                        {contacts.map((c) => {
                            const Icon = c.icon;

                            return (
                                <div key={c.label} className="card !shadow-md p-6 text-center">
                                    <Icon className="mx-auto mb-3 h-6 w-6 text-fg-brand" />
                                    <h3 className="text-[14px] font-semibold text-heading mb-1">
                                        {c.label}
                                    </h3>
                                    <p className="text-[14px] text-body">{c.value}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
            </Reveal>
        </PublicLayout>
    );
}
