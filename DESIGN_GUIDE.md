# Biwracean Design Guide — SPA (Vite + React + TypeScript + Tailwind v4)

> Referensi desain untuk SPA Biwracean. Semua token warna sudah didefinisikan sebagai CSS custom properties di `resources/css/app.css` dan di-export sebagai Tailwind v4 theme colors.  
> Dua antarmuka: **Petugas Loket** (dashboard manajemen) dan **Customer** (pemesanan tiket).

---

## Brand Identity

| Atribut | Nilai |
|---------|-------|
| **Nama** | `biwracean` — selalu lowercase |
| **Icon** | Anchor (dari Lucide icons) |
| **Font** | Gabarito (sans), Courier Prime (monospace) — via Bunny CDN |

---

## Color Palette

Semua warna diakses via utility classes Tailwind: `bg-brand`, `text-heading`, `border-border-default`, dll.

### Brand

| Token | Light | Dark | Penggunaan |
|-------|-------|------|------------|
| `brand` | `#6733FF` | `#7C4DFF` | Primary button, link, border fokus |
| `brand-strong` | `#5229CC` | `#6733FF` | Hover state button |
| `brand-soft` | `#DDD4FF` | `#2D1A80` | Badge latar, selected state |
| `brand-softer` | `#F0EBFF` | `#1A0D4D` | Background highlight ringan |

### Neutral / Background

| Token | Light | Dark | Penggunaan |
|-------|-------|------|------------|
| `neutral-primary-soft` | `#FFFFFF` | `#0F1024` | Background utama, card |
| `neutral-primary` | `#FFFFFF` | `#08091A` | Background solid |
| `neutral-primary-medium` | `#FFFFFF` | `#181A33` | Card hover, elevated |
| `neutral-primary-strong` | `#FFFFFF` | `#262845` | Active card, selected |
| `neutral-secondary-soft` | `#FAFAFF` | `#0F1024` | Background sekunder, input |
| `neutral-secondary-medium` | `#FAFAFF` | `#181A33` | Input background |
| `neutral-secondary-strong` | `#FAFAFF` | `#262845` | Sidebar active item |
| `neutral-tertiary` | `#F2F0FA` | `#181A33` | Button hover (white variant) |
| `neutral-quaternary` | `#E5E1F5` | `#353859` | Border, divider kuat |
| `disabled` | `#F2F0FA` | `#181A33` | Background disabled |

### Text / Foreground

| Token | Light | Dark | Penggunaan |
|-------|-------|------|------------|
| `heading` | `#0F0F2E` | `#FFFFFF` | Judul, heading |
| `body` | `#4A4566` | `#A8A3C0` | Teks paragraf, label |
| `body-subtle` | `#8884A0` | `#7A7590` | Caption, helper text |
| `on-brand` | `#FFFFFF` | `#FFFFFF` | Teks di atas background brand |
| `fg-brand` | `#6733FF` | `#A78BFF` | Link, icon brand |
| `fg-brand-strong` | `#5229CC` | `#C4B0FF` | Active link |
| `fg-disabled` | `#A8A3C0` | `#5A5575` | Teks disabled |
| `fg-danger` | `#EC4747` | `#FF6B6B` | Error, danger text |
| `fg-success-strong` | `#004F3B` | `#00CC88` | Success text |
| `fg-warning` | `#CC5500` | `#FFD166` | Warning text |
| `fg-info` | `#2D1A80` | `#A78BFF` | Info text |

### Status

| Token | Light | Penggunaan |
|-------|-------|------------|
| `danger` | `#EC4747` | Tombol danger, badge |
| `danger-soft` | `#FFF0F0` | Background badge danger |
| `success` | `#00CC88` | Badge success |
| `success-soft` | `#E6FFF5` | Background badge success |
| `warning` | `#FF8C42` | Badge warning |
| `warning-soft` | `#FFF5EB` | Background badge warning |

### Borders

| Token | Light | Dark | Penggunaan |
|-------|-------|------|------------|
| `border-default` | `#E5E1F5` | `#181A33` | Border default card, table |
| `border-default-medium` | `#E5E1F5` | `#262845` | Border input |
| `border-brand` | `#6733FF` | `#A78BFF` | Border fokus, selected |
| `border-success` | `#00A86B` | `#004F3B` | Border success |
| `border-danger` | `#EC4747` | `#EC4747` | Border error |

---

## Typography

Gunakan utility Tailwind: `text-[16px] font-bold text-heading`, dll.

| Style | Size | Weight | Line Height | Color |
|-------|------|--------|-------------|-------|
| **H1** | 32–60px (responsive) | Bold 700 | 1.1 | `text-heading` |
| **H2** | 28–44px | Bold 700 | 1.15 | `text-heading` |
| **H3** | 24–36px | Bold 700 | 1.2 | `text-heading` |
| **H4** | 22–30px | Bold 700 | 1.25 | `text-heading` |
| **H5** | 20–24px | Bold 700 | 1.3 | `text-heading` |
| **H6** | 18–20px | Bold 700 | 1.35 | `text-heading` |
| **Body** | 16px | Normal 400 | 1.7 | `text-body` |
| **Body Small** | 14px | Normal 400 | — | `text-body` |
| **Caption** | 12px | Normal 400 | — | `text-body-subtle` |
| **Label** | 14px | Medium 500 | — | `text-heading` |
| **Button** | 16px | Medium 500 | — | `text-on-brand` / `text-fg-brand` |
| **Price/Mono** | 14px | Courier Prime | — | `text-heading font-price` |

### Dashboard heading compact

Di halaman admin, heading dibatasi:

```tsx
<h1 className="text-[24px] lg:text-[28px] font-bold text-heading">Dashboard</h1>
<h2 className="text-[22px] font-bold text-heading">Daftar Kapal</h2>
<h3 className="text-[20px] font-bold text-heading">Form</h3>
```

---

## Spacing

Grid berbasis 8px. Utility Tailwind `p-{n}` (1 = 4px):

| Token | px | Tailwind |
|-------|-----|----------|
| spacing-2 | 8px | `gap-2`, `p-2` |
| spacing-3 | 12px | `px-3` (input horizontal) |
| spacing-4 | 16px | `gap-4`, `p-4` (button, card) |
| spacing-6 | 24px | `p-6` (container padding) |
| spacing-8 | 32px | `gap-8`, `p-8` |
| spacing-12 | 48px | `p-12` |
| spacing-16 | 64px | `p-16` |

Container: max-width `1152px`, padding horizontal `24px` (`px-6`).

---

## Komponen

Aturan umum:
- **Semua border-radius: 0** (sudut tajam adalah ciri khas Biwracean)
- Border default: `border border-border-default`
- Transisi: 150–200ms ease-out
- Focus ring: `focus:outline-none focus:border-border-brand focus:shadow-[0_0_0_1px_var(--brand)]`

### Button

Dua varian: `brand` (primary) dan `white` (secondary).

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'brand' | 'white' | 'danger';
}

function Button({ variant = 'brand', className, children, disabled, ...props }: ButtonProps) {
    const base = 'btn inline-flex items-center justify-center gap-2 px-6 py-4 text-[16px] font-medium';
    const variants = {
        brand: 'bg-brand text-on-brand hover:bg-brand-strong',
        white: 'bg-white text-fg-brand hover:bg-neutral-tertiary',
        danger: 'bg-danger text-white hover:bg-danger-strong',
    };
    return (
        <button
            className={`${base} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed bg-disabled text-fg-disabled hover:bg-disabled' : ''} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
```

### Input

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

function Input({ label, error, className, ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-2">
            {label && <label className="input-label">{label}</label>}
            <input
                className={`input ${error ? '!border-border-danger' : ''} ${className}`}
                {...props}
            />
            {error && <p className="text-[13px] text-fg-danger">{error}</p>}
        </div>
    );
}
```

### Card

```tsx
<div className="bg-neutral-primary-soft border border-border-default shadow-xs p-5">
    {children}
</div>
```

Card interactive (hover):

```tsx
<div className="bg-neutral-primary-soft border border-border-default shadow-xs p-5 hover:bg-neutral-primary-medium transition-colors duration-150 cursor-pointer">
    {children}
</div>
```

### Status Badge

```tsx
const statusConfig = {
    pending:  { bg: 'bg-warning-soft', text: 'text-fg-warning' },
    paid:     { bg: 'bg-brand-softer', text: 'text-fg-info' },
    validated:{ bg: 'bg-success-soft', text: 'text-fg-success-strong' },
    cancelled:{ bg: 'bg-danger-soft', text: 'text-fg-danger' },
} as const;

function Badge({ status }: { status: keyof typeof statusConfig }) {
    const config = statusConfig[status];
    return (
        <span className={`inline-block px-1.5 py-0.5 text-[13px] font-medium ${config.bg} ${config.text}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
```

### Table

```tsx
<div className="overflow-x-auto">
    <table className="w-full border-collapse">
        <thead>
            <tr className="bg-neutral-secondary-soft text-[13px] font-semibold text-heading">
                <th className="px-3 py-4 text-left">Booking Code</th>
                <th className="px-3 py-4 text-left">Customer</th>
                <th className="px-3 py-4 text-left">Status</th>
                <th className="px-3 py-4 text-right">Total</th>
                <th className="px-3 py-4 text-center">Aksi</th>
            </tr>
        </thead>
        <tbody>
            <tr className="border-t border-border-default">
                <td className="px-3 py-4">BWRA3F7K</td>
                <td className="px-3 py-4">John Doe</td>
                <td className="px-3 py-4"><Badge status="pending" /></td>
                <td className="px-3 py-4 text-right">Rp 500.000</td>
                <td className="px-3 py-4 text-center">...</td>
            </tr>
        </tbody>
    </table>
</div>
```

### Modal

```tsx
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-neutral-primary-soft border border-border-default shadow-lg p-6 min-w-[400px]">
                {children}
            </div>
        </div>
    );
}
```

### Sidebar (Petugas Loket)

```tsx
// 256px width, item gap 8px
<aside className="w-64 h-screen bg-neutral-primary-soft border-r border-border-default">
    <nav className="flex flex-col gap-2 p-4">
        <a href="/dashboard"
           className="flex items-center gap-3 px-4 py-2.5 text-[14px] rounded-none
                      data-[active=true]:bg-neutral-secondary-strong data-[active=true]:text-fg-brand-strong
                      text-body hover:bg-neutral-tertiary transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
        </a>
        {/* ... menu items ... */}
    </nav>
</aside>
```

### Search Input (Petugas Loket)

```tsx
<div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-body-subtle" />
    <input
        className="input !pl-10"
        placeholder="Cari kode booking, nama, email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
    />
</div>
```

---

## Antarmuka Customer

Halaman yang dibutuhkan untuk Customer:

| Halaman | Route | Description |
|---------|-------|-------------|
| Login / Register | `/login`, `/register` | Auth |
| Cari Jadwal | `/sailings` | List pelayaran dengan filter bulan/tahun |
| Detail Pelayaran | `/sailings/{uuid}` | Lihat jadwal + pilih kelas tiket |
| Buat Pesanan | `/sailings/{uuid}/book` | Pilih leg, kelas, quantity |
| Pesanan Saya | `/orders` | List pesanan milik user |
| Detail Pesanan | `/orders/{uuid}` | Detail + tombol bayar/upload bukti/batal |

### Customer — Halaman Cari Jadwal

```tsx
function SailingsPage() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    return (
        <div className="section-container py-6">
            <h1 className="text-[28px] font-bold text-heading mb-6">Cari Jadwal Pelayaran</h1>

            {/* Filter bulan/tahun */}
            <div className="flex gap-4 mb-8">
                <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="input w-auto"
                >
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString('id', { month: 'long' })}
                        </option>
                    ))}
                </select>
                <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="input w-auto"
                >
                    {[2026, 2027].map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>

            {/* Sailing cards */}
            <div className="grid gap-4">
                {sailings.map((sailing) => (
                    <Link key={sailing.uuid} to={`/sailings/${sailing.uuid}`}>
                        <div className="card p-5 hover:bg-neutral-primary-medium transition-colors cursor-pointer">
                            <h2 className="text-[18px] font-semibold text-heading">{sailing.name}</h2>
                            <p className="text-[14px] text-body mt-1">
                                {sailing.departure_date} → {sailing.arrival_date ?? '-'}
                            </p>
                            <p className="text-[13px] text-body-subtle mt-1">Kapal: {sailing.ship.name}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
```

### Customer — Detail Pelayaran & Booking

Untuk setiap leg, tampilkan daftar kelas tiket beserta harga dan stok.

```tsx
function SailingDetailPage() {
    const { uuid } = useParams();
    const [sailing, setSailing] = useState<Sailing | null>(null);
    const [selectedLeg, setSelectedLeg] = useState<number | null>(null);

    // GET /api/sailings/{uuid}

    if (!sailing) return null;

    return (
        <div className="section-container py-6">
            <h1 className="text-[24px] font-bold text-heading">{sailing.name}</h1>
            <p className="text-body mt-1">Berangkat: {sailing.departure_date}</p>

            {sailing.legs.map((leg) => (
                <div key={leg.id} className="card p-5 mt-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-heading">{leg.origin_port.name}</p>
                            <p className="text-[13px] text-body-subtle">{leg.departure_time}</p>
                        </div>
                        <span className="text-body-subtle">→</span>
                        <div className="text-right">
                            <p className="font-semibold text-heading">{leg.destination_port.name}</p>
                            <p className="text-[13px] text-body-subtle">{leg.arrival_time}</p>
                        </div>
                    </div>

                    {/* Ticket classes */}
                    <div className="mt-4 space-y-2">
                        {leg.route.ticket_availabilities.map((avail) => (
                            <div key={avail.id}
                                 className="flex items-center justify-between p-3 border border-border-default"
                            >
                                <div>
                                    <p className="font-medium text-heading">{avail.ticket_class.name}</p>
                                    <p className="text-[13px] text-body-subtle">
                                        Sisa: {avail.available_stock - avail.sold_stock}
                                    </p>
                                </div>
                                <p className="font-price text-[16px] text-heading">
                                    Rp {avail.price.toLocaleString('id-ID')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
```

### Customer — Daftar Pesanan Saya

```tsx
function MyOrdersPage() {
    const [orders, setOrders] = useState<TicketOrder[]>([]);

    // GET /api/ticket-orders

    return (
        <div className="section-container py-6">
            <h1 className="text-[24px] font-bold text-heading mb-6">Pesanan Saya</h1>

            <div className="space-y-3">
                {orders.map((order) => (
                    <div key={order.uuid} className="card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-heading">{order.booking_code}</p>
                                <p className="text-[13px] text-body-subtle">
                                    {order.sailing?.name} — {order.sailing?.departure_date}
                                </p>
                            </div>
                            <Badge status={order.status} />
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <p className="text-body">
                                {order.sailing_leg?.origin_port.name} → {order.sailing_leg?.destination_port.name}
                            </p>
                            <p className="font-price text-[16px] text-heading">
                                Rp {order.total_price.toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div className="mt-3 flex gap-2">
                            {order.status === 'pending' && (
                                <>
                                    <Button variant="brand" onClick={() => handlePay(order.uuid)}>
                                        Bayar
                                    </Button>
                                    <Button variant="white" onClick={() => handleUploadProof(order.uuid)}>
                                        Upload Bukti
                                    </Button>
                                    <Button variant="danger" onClick={() => handleCancel(order.uuid)}>
                                        Batalkan
                                    </Button>
                                </>
                            )}
                            {order.status === 'paid' && (
                                <Button variant="danger" onClick={() => handleCancel(order.uuid)}>
                                    Batalkan
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

---

## Antarmuka Petugas Loket

Halaman yang dibutuhkan untuk Petugas Loket:

| Halaman | Route | Description |
|---------|-------|-------------|
| Login | `/login` | Auth (sama dengan customer) |
| Dashboard | `/dashboard` | Ringkasan, notifikasi realtime |
| Pesanan | `/orders` | Semua pesanan dengan search/filter |
| Buat Pesanan | `/orders/create` | Pilih sailing, leg, kelas, isi data customer |
| Detail Pesanan | `/orders/{uuid}` | Lihat + aksi (bayar, upload, validasi, batal) |
| Jadwal | `/sailings` | Lihat semua pelayaran |
| Manajemen Data | `/ships`, `/ports`, dll | Jika diperlukan |

### Petugas Loket — Dashboard

```tsx
function DashboardPage() {
    return (
        <div className="p-6">
            <h1 className="text-[24px] font-bold text-heading">Dashboard</h1>

            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-4 mt-6">
                {[
                    { label: 'Pesanan Hari Ini', value: 12 },
                    { label: 'Menunggu Pembayaran', value: 5 },
                    { label: 'Perlu Divalidasi', value: 3 },
                    { label: 'Total Penumpang', value: 234 },
                ].map((stat) => (
                    <div key={stat.label} className="card p-5">
                        <p className="text-[13px] text-body-subtle">{stat.label}</p>
                        <p className="text-[32px] font-bold text-heading mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

### Petugas Loket — Daftar Semua Pesanan

```tsx
function OrdersPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [orders, setOrders] = useState<TicketOrder[]>([]);

    // GET /api/admin/ticket-orders?search=...&status=...&page=...

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-[22px] font-bold text-heading">Pesanan Tiket</h1>
                <Button variant="brand" onClick={() => navigate('/orders/create')}>
                    + Pesanan Baru
                </Button>
            </div>

            {/* Search & filter */}
            <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-body-subtle" />
                    <input
                        className="input !pl-10"
                        placeholder="Cari kode booking, nama, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input w-44"
                >
                    <option value="">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="validated">Validated</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-border-default">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-neutral-secondary-soft text-[13px] font-semibold text-heading">
                            <th className="px-3 py-4 text-left">Kode</th>
                            <th className="px-3 py-4 text-left">Customer</th>
                            <th className="px-3 py-4 text-left">Rute</th>
                            <th className="px-3 py-4 text-left">Status</th>
                            <th className="px-3 py-4 text-right">Total</th>
                            <th className="px-3 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.uuid}
                                className="border-t border-border-default hover:bg-neutral-primary-medium transition-colors"
                            >
                                <td className="px-3 py-4 font-medium text-heading">{order.booking_code}</td>
                                <td className="px-3 py-4 text-body">{order.customer_name}</td>
                                <td className="px-3 py-4 text-body">
                                    {order.sailing_leg?.origin_port.name} → {order.sailing_leg?.destination_port.name}
                                </td>
                                <td className="px-3 py-4"><Badge status={order.status} /></td>
                                <td className="px-3 py-4 text-right font-price text-heading">
                                    Rp {order.total_price.toLocaleString('id-ID')}
                                </td>
                                <td className="px-3 py-4 text-center">
                                    <Button variant="white" onClick={() => navigate(`/orders/${order.uuid}`)}>
                                        Detail
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
```

### Petugas Loket — Buat Pesanan Baru

```tsx
function CreateOrderPage() {
    const [sailingId, setSailingId] = useState<number | null>(null);
    const [sailingLegId, setSailingLegId] = useState<number | null>(null);
    const [ticketClassId, setTicketClassId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [sailings, setSailings] = useState<Sailing[]>([]);

    // GET /api/admin/sailings — load sailings with legs + availabilities
    // POST /api/admin/ticket-orders — submit form

    return (
        <div className="p-6 max-w-2xl">
            <h1 className="text-[22px] font-bold text-heading mb-6">Pesanan Baru</h1>

            {/* Pilih sailing */}
            <div className="space-y-4">
                <select className="input" value={sailingId ?? ''} onChange={(e) => setSailingId(Number(e.target.value))}>
                    <option value="">Pilih Pelayaran</option>
                    {sailings.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.departure_date}</option>)}
                </select>

                {/* Pilih leg + kelas tiket (muncul setelah sailing dipilih) */}
                {/* ... */}

                <Input label="Nama Customer" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                <Input label="Email Customer" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                <Input label="No. Telepon" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                <Input label="Jumlah Tiket" type="number" min={1} max={10} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                <Input label="Catatan" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="mt-6">
                <Button variant="brand" onClick={handleSubmit}>Buat Pesanan</Button>
            </div>
        </div>
    );
}
```

---

## Shadows

| Level | Value | Usage |
|-------|-------|-------|
| `xs` | `shadow-xs` | Card default |
| `sm` | `shadow-sm` | |
| `md` | `shadow-md` | |
| `lg` | `shadow-lg` | Modal |
| `xl` | `shadow-xl` | |
| `2xl` | `shadow-2xl` | Toast |

---

## Animasi

CSS classes dari `resources/css/app.css`:

| Class | Effect |
|-------|--------|
| `animate-fade-in-up` | Opacity 0→1 + translateY 32px→0, 600ms |
| `animate-fade-in` | Opacity 0→1, 500ms |
| `animate-slide-in-right` | TranslateX 100%→0, 300ms |
| `animate-slide-down` | Opacity 0→1 + translateY -12px→0, 250ms |

```tsx
<div className="animate-fade-in-up">Muncul dengan animasi</div>
```

---

## Dark Mode

Implementasi: class `.dark` pada `<html>`.
Semua CSS variable berubah nilai secara otomatis — utility Tailwind langsung menyesuaikan.

```tsx
// ThemeProvider — existing component di resources/js/components/ThemeProvider.tsx
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';

// Cek resolved theme
const { resolvedTheme, setTheme } = useTheme();
const isDark = resolvedTheme === 'dark';
```

---

## Ikon

Gunakan **Lucide icons** (sudah terinstall di package.json):

```tsx
import { Search, Ship, Anchor, Ticket, X } from 'lucide-react';
```

Standard sizes: `h-4 w-4` (16px), `h-5 w-5` (20px), `h-6 w-6` (24px), `h-8 w-8` (32px).

---

## Format Harga

```typescript
function formatPrice(price: number): string {
    return `Rp ${price.toLocaleString('id-ID')}`;
}

// Usage: <span className="font-price">{formatPrice(order.total_price)}</span>
```

---

## Referensi File

| File | Konten |
|------|--------|
| `resources/css/app.css` | Semua design tokens, component base styles (`.btn`, `.input`, `.card`), animations |
| `API_REFERENCE.md` | Dokumentasi API endpoint untuk SPA |
| `REFERENCE.md` | Design system spec lengkap |
