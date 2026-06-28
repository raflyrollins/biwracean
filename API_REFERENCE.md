# API Reference — SPA (Vite + React + TypeScript)

> Integration guide for the Biwracean SPA frontend. Three user roles: **Customer** (penumpang), **Petugas Loket** (ticket counter — admin with permissions), and **Superadmin**.

---

## Dasar

| Item               | Nilai                                                                         |
| ------------------ | ----------------------------------------------------------------------------- |
| **Base URL** (dev) | `http://biwracean.test/api`                                                   |
| **Auth**           | Bearer Token (Laravel Sanctum) — simpan di `localStorage` atau memory         |
| **File Upload**    | `multipart/form-data`, max 5 MB (customer), 2 MB (petugas)                    |
| **Realtime**       | WebSocket — Laravel Reverb (Pusher protocol) via `laravel-echo` + `pusher-js` |
| **Storage URL**    | `{APP_URL}/storage/{path}`                                                    |

Semua endpoint mengembalikan JSON. Error otomatis terdeteksi sebagai JSON untuk rute `/api/*`.

---

## Autentikasi

Auth flow sama untuk Customer dan Petugas Loket. Token disimpan di `localStorage` dan dikirim via header `Authorization: Bearer`.

### Register (Customer only)

```http
POST /api/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone": "08123456789"
}
```

**Response `201`:**

```json
{
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
    "token": "1|abc123..."
}
```

### Login

```http
POST /api/login
Content-Type: application/json

{
    "email": "admin@biwracean.com",
    "password": "password"
}
```

**Response `200`:**

```json
{
    "user": {
        "id": 1,
        "name": "Admin Biwracean",
        "email": "admin@biwracean.com",
        "is_admin": true,
        "role_id": 1,
        "phone": null
    },
    "token": "1|abc123..."
}
```

> Setiap login baru menghapus token lama dan membuat token baru.
>
> **Petugas Loket** login dengan akun admin (memiliki `is_admin: true` dan `role` dengan permissions).
> Bedakan akses di SPA dari response `is_admin` dan `role.permissions` (jika perlu).

### Me (Profil)

```http
GET /api/me
Authorization: Bearer 1|abc123...
```

**Response `200`:**

```json
{
    "user": {
        "id": 1,
        "name": "Admin Biwracean",
        "email": "admin@biwracean.com",
        "is_admin": true,
        "role_id": 1,
        "phone": null
    }
}
```

### Logout

```http
POST /api/logout
Authorization: Bearer 1|abc123...
```

**Response `200`:** `{ "message": "Berhasil logout." }`

### Axios Instance (SPA)

```typescript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://biwracean.test/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default api;
```

---

## Jadwal Pelayaran (No Auth)

### List Pelayaran

```http
GET /api/sailings?month=6&year=2026
```

Filter: `month` (int, default: bulan sekarang), `year` (int, default: tahun sekarang).  
Hanya menampilkan sailing dengan status `scheduled` / `in_progress`.  
`ticket_availabilities` difilter sesuai bulan/tahun.

**Response `200`:**

```json
{
    "data": [
        {
            "id": 1,
            "uuid": "550e8400-e29b-41d4-a716-446655440000",
            "name": "KM Biwracean 1",
            "departure_date": "2026-06-15",
            "arrival_date": "2026-06-17",
            "status": "scheduled",
            "ship": { "id": 1, "name": "KM Biwracean" },
            "legs": [
                {
                    "id": 1,
                    "leg_order": 1,
                    "departure_time": "08:00:00",
                    "arrival_time": "14:00:00",
                    "origin_port": { "id": 1, "name": "Tanjung Priok" },
                    "destination_port": { "id": 2, "name": "Surabaya" },
                    "route": {
                        "id": 1,
                        "ticket_availabilities": [
                            {
                                "id": 1,
                                "uuid": "...",
                                "date": "2026-06-15",
                                "price": 250000.0,
                                "available_stock": 100,
                                "sold_stock": 20,
                                "ticket_class": {
                                    "id": 1,
                                    "name": "Ekonomi",
                                    "code": "EKO"
                                }
                            }
                        ]
                    }
                }
            ]
        }
    ]
}
```

### Detail Pelayaran

```http
GET /api/sailings/550e8400-e29b-41d4-a716-446655440000
```

**Response `200`:** Sama seperti di atas, namun:

- `ticket_availabilities` hanya untuk tanggal `>= now()` dengan `available_stock > 0`
- `ship` juga menyertakan `hull_number` dan `capacity`
- Port menyertakan `city`

---

## Customer — Pemesanan Tiket (Auth Required)

Semua endpoint membutuhkan header:

```
Authorization: Bearer 1|abc123...
```

### Buat Pesanan

Customer memesan tiket untuk dirinya sendiri. Data customer (`customer_name`, `customer_email`, `customer_phone`) diambil otomatis dari user login.

```http
POST /api/ticket-orders
Content-Type: application/json

{
    "sailing_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "sailing_leg_id": 1,
    "ticket_class_id": 1,
    "quantity": 2,
    "notes": "Dekat jendela"
}
```

**Validation:**

| Field             | Rule                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `sailing_uuid`    | required, string, exists `sailings.uuid`                            |
| `sailing_leg_id`  | required, integer, exists `sailing_legs.id`, must belong to sailing |
| `ticket_class_id` | required, integer, exists `ticket_classes.id`                       |
| `quantity`        | required, integer, min 1, max 10                                    |
| `notes`           | nullable, string, max 500                                           |

**Response `201`:**

```json
{
    "data": {
        "id": 1,
        "uuid": "660e8400-e29b-41d4-a716-446655440001",
        "booking_code": "BWRA3F7K",
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "customer_phone": "08123456789",
        "quantity": 2,
        "total_price": 500000.0,
        "status": "pending",
        "notes": "Dekat jendela",
        "payment_proof": null,
        "created_at": "2026-06-27T08:00:00+07:00",
        "sailing": {
            "id": 1,
            "uuid": "...",
            "name": "KM Biwracean 1",
            "departure_date": "2026-06-15"
        },
        "sailing_leg": {
            "id": 1,
            "origin_port": { "id": 1, "name": "Tanjung Priok" },
            "destination_port": { "id": 2, "name": "Surabaya" },
            "route": { "id": 1, "base_price": 175000 }
        },
        "ticket_class": { "id": 1, "name": "Ekonomi", "code": "EKO" }
    }
}
```

### List Pesanan Saya

```http
GET /api/ticket-orders
Authorization: Bearer 1|abc123...
```

Hanya menampilkan pesanan milik user yang login, diurutkan dari terbaru.

**Response `200`:** `{ "data": [ TicketOrder... ] }`

### Detail Pesanan

```http
GET /api/ticket-orders/660e8400-e29b-41d4-a716-446655440001
Authorization: Bearer 1|abc123...
```

**Response `200`:** Sama seperti response create, ditambah `sailing.arrival_date` dan `sailing.ship`.

---

## Customer — Pembayaran (Auth Required)

### Upload Bukti Transfer

Customer mengupload bukti transfer. Status tetap `pending` sampai admin/petugas loket menyetujui.

```http
POST /api/ticket-orders/660e8400-e29b-41d4-a716-446655440001/upload-proof
Content-Type: multipart/form-data
Authorization: Bearer 1|abc123...

--boundary
Content-Disposition: form-data; name="payment_proof"; filename="bukti.jpg"
Content-Type: image/jpeg

[binary image data]
--boundary--
```

**Validation:**

| Field           | Rule                                             |
| --------------- | ------------------------------------------------ |
| `payment_proof` | required, image, mimes:jpg/jpeg/png, max:5120 KB |

**Response `200`:**

```json
{
    "message": "Bukti pembayaran berhasil diupload.",
    "data": {
        "...": "...",
        "payment_proof": "payments/abc123.jpg",
        "status": "pending"
    }
}
```

File dapat diakses di: `{APP_URL}/storage/payments/abc123.jpg`

**Error `403`:** Jika `user_id` tidak sesuai dengan user login.  
**Error `422`:** Jika status bukan `pending`.

### Konfirmasi Bayar (Langsung Dianggap Lunas)

Untuk pembayaran langsung (tanpa upload bukti). Status langsung menjadi `paid` dan stok tiket berkurang.

```http
POST /api/ticket-orders/660e8400-e29b-41d4-a716-446655440001/pay
Authorization: Bearer 1|abc123...
```

**Response `200`:**

```json
{
    "message": "Pembayaran berhasil.",
    "data": { "...": "...", "status": "paid" }
}
```

---

## Petugas Loket — Manajemen Pesanan

> **Catatan:** Endpoint di bawah ini menggunakan **web controller** yang belum memiliki versi API JSON.
> Untuk SPA, endpoint ini perlu ditambahkan di `routes/api.php` dengan mengadaptasi logika dari
> `app/Http/Controllers/TicketOrderController.php` (web). Response dikembalikan sebagai JSON, bukan Inertia.

### List Semua Pesanan (dengan filter)

```http
GET /api/admin/ticket-orders?search=&status=&date_from=&date_to=&per_page=
Authorization: Bearer 1|abc123...  (user must be admin)
```

**Query params:**

| Param       | Type         | Description                                            |
| ----------- | ------------ | ------------------------------------------------------ |
| `search`    | string       | Cari `booking_code`, `customer_name`, `customer_email` |
| `status`    | string       | `pending`, `paid`, `validated`, `cancelled`            |
| `date_from` | date (Y-m-d) | Filter `created_at >=`                                 |
| `date_to`   | date (Y-m-d) | Filter `created_at <=`                                 |
| `per_page`  | int          | Max 100, default 10                                    |

**Response `200`:**

```json
{
    "data": [ TicketOrder... ],
    "meta": {
        "current_page": 1,
        "last_page": 5,
        "per_page": 10,
        "total": 50
    }
}
```

Relations yang dimuat: `sailing`, `sailingLeg.originPort`, `sailingLeg.destinationPort`, `ticketClass`.

### Buat Pesanan (untuk walk-in customer)

Petugas loket membuat pesanan atas nama customer walk-in. Berbeda dengan API customer, endpoint ini membutuhkan data customer manual.

```http
POST /api/admin/ticket-orders
Content-Type: application/json
Authorization: Bearer 1|abc123...  (user must be admin)

{
    "sailing_id": 1,
    "sailing_leg_id": 1,
    "ticket_class_id": 1,
    "quantity": 2,
    "customer_name": "Budi Santoso",
    "customer_email": "budi@example.com",
    "customer_phone": "08123456789",
    "notes": "Dekat jendela"
}
```

**Validation:**

| Field             | Rule                                                 |
| ----------------- | ---------------------------------------------------- |
| `sailing_id`      | required, exists `sailings.id` (integer, bukan uuid) |
| `sailing_leg_id`  | required, exists `sailing_legs.id`                   |
| `ticket_class_id` | required, exists `ticket_classes.id`                 |
| `quantity`        | required, integer, min 1, max 10                     |
| `customer_name`   | required, string, max 255                            |
| `customer_email`  | required, email, max 255                             |
| `customer_phone`  | required, string, max 20                             |
| `notes`           | nullable, string, max 500                            |

### Upload Bukti (atas nama pesanan)

Petugas dapat mengupload bukti untuk pesanan apa pun. Maks 2 MB (lebih kecil dari customer).

```http
POST /api/admin/ticket-orders/660e8400-e29b-41d4-a716-446655440001/upload-proof
Content-Type: multipart/form-data
Authorization: Bearer 1|abc123...  (user must be admin)

--boundary
Content-Disposition: form-data; name="payment_proof"; filename="bukti.jpg"
Content-Type: image/jpeg

[binary image data]
--boundary--
```

**Validation:**

| Field           | Rule                                             |
| --------------- | ------------------------------------------------ |
| `payment_proof` | required, image, mimes:jpg/jpeg/png, max:2048 KB |

### Konfirmasi Bayar

```http
POST /api/admin/ticket-orders/660e8400-e29b-41d4-a716-446655440001/pay
Authorization: Bearer 1|abc123...  (user must be admin)
```

### Validasi Tiket

Petugas memvalidasi tiket yang sudah `paid` → `validated`.

```http
POST /api/admin/ticket-orders/660e8400-e29b-41d4-a716-446655440001/validate
Authorization: Bearer 1|abc123...  (user must be admin)
```

### Batalkan Pesanan

```http
POST /api/admin/ticket-orders/660e8400-e29b-41d4-a716-446655440001/cancel
Authorization: Bearer 1|abc123...  (user must be admin)
```

---

## Petugas Loket — Master Data (Read-only)

> Endpoint CRUD untuk master data ada di web controller (`app/Http/Controllers/{Ship,Port,Route,etc}Controller.php`).
> Untuk SPA, buatkan versi API JSON-nya di `routes/api.php`.

| Endpoint                               | Description                   |
| -------------------------------------- | ----------------------------- |
| `GET /api/admin/ships`                 | Daftar kapal                  |
| `GET /api/admin/ports`                 | Daftar pelabuhan              |
| `GET /api/admin/routes`                | Daftar rute                   |
| `GET /api/admin/ticket-classes`        | Daftar kelas tiket            |
| `GET /api/admin/ticket-availabilities` | Daftar ketersediaan tiket     |
| `GET /api/admin/sailings`              | Daftar pelayaran (admin view) |
| `GET /api/admin/sailings/{sailing}`    | Detail pelayaran (admin view) |

---

## Status Flow Tiket

```
                         ┌──────────────────┐
                         │     pending      │
                         └────────┬─────────┘
                                  │
                  ┌───────────────┼───────────────┐
                  │               │               │
                  ▼               ▼               ▼
            upload-proof        pay           cancel
                  │               │               │
                  ▼               ▼               ▼
 ┌──────────────────────┐  ┌────────┐  ┌──────────────┐
 │ pending (dgn bukti)  │  │  paid  │  │  cancelled   │
 └──────────────────────┘  └───┬────┘  └──────────────┘
           │                   │
           └─────validasi──────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  validated   │
                        └──────────────┘
```

| Aksi         | Status Sebelum | Status Sesudah        | Stok Berubah | Siapa              |
| ------------ | -------------- | --------------------- | ------------ | ------------------ |
| Upload proof | `pending`      | `pending` (no change) | Tidak        | Customer / Petugas |
| Bayar        | `pending`      | `paid`                | Sold +1      | Customer / Petugas |
| Validasi     | `paid`         | `validated`           | Tidak        | Petugas saja       |
| Batalkan     | `pending`      | `cancelled`           | Tidak        | Customer / Petugas |
| Batalkan     | `paid`         | `cancelled`           | Sold -1      | Customer / Petugas |

---

## Struktur Data (TypeScript)

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    is_admin: boolean;
    role_id: number | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface LoginResponse {
    user: User;
    token: string;
}

interface Port {
    id: number;
    name: string;
    code?: string;
    city?: string;
}

interface Ship {
    id: number;
    uuid: string;
    name: string;
    hull_number?: string;
    capacity?: number;
}

interface TicketClass {
    id: number;
    name: string;
    code: string;
}

interface TicketAvailability {
    id: number;
    uuid: string;
    date: string;
    price: number;
    available_stock: number;
    sold_stock: number;
    ticket_class: TicketClass;
}

interface SailingLeg {
    id: number;
    leg_order: number;
    departure_time: string | null;
    arrival_time: string | null;
    origin_port: Port;
    destination_port: Port;
    route: {
        id: number;
        ticket_availabilities: TicketAvailability[];
    };
}

interface Sailing {
    id: number;
    uuid: string;
    name: string;
    departure_date: string;
    arrival_date: string | null;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    ship: Ship;
    legs: SailingLeg[];
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
    status: 'pending' | 'paid' | 'validated' | 'cancelled';
    notes: string | null;
    payment_proof: string | null;
    created_at: string;
    updated_at: string;
    sailing?: {
        id: number;
        uuid: string;
        name: string;
        departure_date: string;
        arrival_date?: string;
        ship?: Ship;
    };
    sailing_leg?: {
        id: number;
        origin_port: Port;
        destination_port: Port;
        route: { id: number; base_price: number };
    };
    ticket_class?: TicketClass;
}
```

---

## Realtime Events (WebSocket)

Koneksi ke Laravel Reverb menggunakan `laravel-echo` + `pusher-js`.

### Config Reverb (Development)

```
host:     localhost
port:     8080
scheme:   http
appKey:   qlxeebmdawadwwuwvqk0
appId:    231798
```

### Echo Setup (SPA)

```typescript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const echo = new Echo({
    broadcaster: 'reverb',
    Pusher,
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
});
```

### Broadcast Channels

| Channel               | Auth                          | Siapa yang Mendengar  |
| --------------------- | ----------------------------- | --------------------- |
| `admin.ticket-orders` | User dengan `is_admin = true` | Petugas Loket / Admin |
| `admin.ticket-stock`  | User dengan `is_admin = true` | Petugas Loket / Admin |

### Listening

```typescript
// Petugas Loket — dengar order baru
echo.private('admin.ticket-orders')
    .listen('.ticket-order.created', (e: { order: TicketOrder }) => {
        // tampilkan notifikasi
    })
    .listen(
        '.ticket-order.status-changed',
        (e: {
            uuid: string;
            bookingCode: string;
            oldStatus: string;
            newStatus: string;
        }) => {
            // update status di tabel
        },
    )
    .listen(
        '.payment-proof.uploaded',
        (e: {
            uuid: string;
            bookingCode: string;
            customerName: string;
            paymentProof: string;
        }) => {
            // tampilkan notifikasi upload bukti
        },
    );

// Petugas Loket — dengar perubahan stok
echo.private('admin.ticket-stock').listen(
    '.ticket-stock.updated',
    (e: {
        stock: {
            ship_name: string;
            origin: string;
            destination: string;
            ticket_class: string;
            date: string;
            sold_stock: number;
            remaining: number;
        };
    }) => {
        // update tampilan stok
    },
);
```

### Events

| Event Name                     | Trigger                      | Payload                                                                  |
| ------------------------------ | ---------------------------- | ------------------------------------------------------------------------ |
| `.ticket-order.created`        | Create order                 | `{ order }`                                                              |
| `.ticket-order.status-changed` | Pay / Validate / Cancel      | `{ uuid, bookingCode, oldStatus, newStatus }`                            |
| `.payment-proof.uploaded`      | Upload proof                 | `{ uuid, bookingCode, customerName, paymentProof, origin, destination }` |
| `.ticket-stock.updated`        | Pay / Cancel (affects stock) | `{ stock }`                                                              |

---

## Authorization di SPA

Bedakan tampilan berdasarkan role user:

```typescript
// Cek dari response login atau /api/me
interface SPAUser extends User {
    permissions?: string[];
}

// Customer: hanya melihat pesanan sendiri
if (!user.is_admin) {
    // Redirect ke halaman customer
}

// Petugas Loket: akses penuh ke manajemen
if (user.is_admin) {
    // Tampilkan sidebar admin, tabel semua orders, dll
}

// Superadmin: memiliki semua permission (['*'])
// Permission lain: dashboard, ships, ports, routes, sailings, ticket_classes, ticket_availabilities, ticket_orders
```
