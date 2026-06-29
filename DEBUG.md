# DEBUG: Notifikasi Realtime + Database untuk SPA (Mobile API)

## Overview

Dua layer notifikasi:

1. **Realtime** — via `TicketOrderUserNotification` broadcast ke private channel `user.{userId}` (Laravel Reverb)
2. **Database** — via `UserNotification` model, disimpan ke tabel `user_notifications` untuk polling/history

Ketika admin mengkonfirmasi pembayaran (`pending → paid`), memvalidasi tiket (`paid → validated`), atau membatalkan tiket (`pending/paid → cancelled`), kedua layer akan dikirim jika order memiliki `user_id`.

---

## Layer 1: Realtime Broadcast

### Event: `App\Events\TicketOrderUserNotification`

```php
class TicketOrderUserNotification implements ShouldBroadcast
```

**Broadcast data:**

| Property       | Type   | Deskripsi              |
| -------------- | ------ | ---------------------- |
| `uuid`         | string | UUID tiket order       |
| `bookingCode`  | string | Kode booking           |
| `oldStatus`    | string | Status sebelum berubah |
| `newStatus`    | string | Status setelah berubah |
| `customerName` | string | Nama pemesan           |
| `userId`       | int    | ID user pemilik order  |

**Channel:**

`private-user.{userId}` → authorised di `routes/channels.php`:

```php
Broadcast::channel('user.{id}', function (User $user, int $id) {
    return (int) $user->id === $id;
});
```

**Broadcast name:** `ticket-order.notification`

---

## Layer 2: Database Notification

### Model: `App\Models\UserNotification`

| Field             | Type                          | Deskripsi                                                   |
| ----------------- | ----------------------------- | ----------------------------------------------------------- |
| `id`              | int                           | Primary key                                                 |
| `user_id`         | FK → users                    | Pemilik notifikasi                                          |
| `ticket_order_id` | FK → ticket_orders (nullable) | Order terkait                                               |
| `type`            | string                        | `payment_confirmed`, `ticket_validated`, `ticket_cancelled` |
| `message`         | string                        | Teks notifikasi (lengkap dengan booking_code)               |
| `is_read`         | boolean (default false)       | Status baca                                                 |
| `created_at`      | timestamp                     | Waktu dibuat                                                |
| `updated_at`      | timestamp                     | Waktu diupdate                                              |

Index: `(user_id, is_read)` untuk query unread count.

### API Endpoints (auth:sanctum)

| Method | Endpoint                                 | Deskripsi                                             |
| ------ | ---------------------------------------- | ----------------------------------------------------- |
| GET    | `/api/notifications`                     | Paginate 20 notifikasi user                           |
| GET    | `/api/notifications/unread-count`        | `{ "data": { "count": 3 } }`                          |
| POST   | `/api/notifications/{notification}/read` | Tandai satu notifikasi sudah dibaca (cek kepemilikan) |
| POST   | `/api/notifications/read-all`            | Tandai semua notifikasi user sudah dibaca             |

Response `GET /api/notifications`:

```json
{
    "data": [
        {
            "id": 1,
            "user_id": 5,
            "ticket_order_id": 10,
            "type": "payment_confirmed",
            "message": "Pembayaran tiket TK-12345 telah dikonfirmasi",
            "is_read": false,
            "created_at": "2026-06-29T12:00:00.000000Z",
            "updated_at": "2026-06-29T12:00:00.000000Z",
            "ticket_order": {
                "id": 10,
                "uuid": "abc-123",
                "booking_code": "TK-12345"
            }
        }
    ]
}
```

---

## Event Flow + Database

```
Admin pay (pending → paid)
  → TicketOrderStatusChanged::dispatch       → admin.ticket-orders
  → TicketOrderUserNotification::dispatch    → private-user.{id}  [if user_id]
  → UserNotification::create                 → database

Admin validate (paid → validated)
  → TicketOrderStatusChanged::dispatch       → admin.ticket-orders
  → TicketOrderUserNotification::dispatch    → private-user.{id}  [if user_id]
  → UserNotification::create                 → database

Admin cancel (pending/paid → cancelled)
  → TicketOrderStatusChanged::dispatch       → admin.ticket-orders
  → TicketOrderUserNotification::dispatch    → private-user.{id}  [if user_id]
  → UserNotification::create                 → database
```

---

## Yang Diubah

### Baru

| File                                                                        | Deskripsi                                                                             |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `database/migrations/2026_06_29_010069_create_user_notifications_table.php` | Migration tabel `user_notifications`                                                  |
| `app/Models/UserNotification.php`                                           | Model + casts `is_read => boolean`, relasi `belongsTo User` & `belongsTo TicketOrder` |
| `app/Http/Controllers/Api/UserNotificationController.php`                   | `index()`, `unreadCount()`, `markRead()`, `markAllRead()`                             |
| `app/Events/TicketOrderUserNotification.php`                                | Event broadcast ke private channel `user.{userId}`                                    |

### Diubah

| File                                                 | Perubahan                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `config/cors.php`                                    | Tambah `'broadcasting/auth'` ke `paths` (CORS untuk Echo auth)                       |
| `routes/channels.php`                                | Tambah channel auth `user.{id}`                                                      |
| `routes/api.php`                                     | Tambah 4 routes notification + `POST /broadcasting/auth` (auth:sanctum)              |
| `app/Models/User.php`                                | Tambah `notifications()` HasMany + PHPDoc                                            |
| `app/Http/Controllers/TicketOrderController.php`     | Dispatch event + simpan `UserNotification` di `pay()`, `validateOrder()`, `cancel()` |
| `app/Http/Controllers/Api/TicketOrderController.php` | Dispatch event + simpan `UserNotification` di `pay()`, `validateOrder()`, `cancel()` |

---

## Catatan Penting

### CORS & Guard `broadcasting/auth`

**Dua endpoint broadcast auth:**

| Endpoint                      | Guard           | Digunakan oleh                 |
| ----------------------------- | --------------- | ------------------------------ |
| `POST /broadcasting/auth`     | `web` (default) | Admin panel (Inertia, session) |
| `POST /api/broadcasting/auth` | `auth:sanctum`  | SPA (Bearer token)             |

**403 Forbidden pada SPA** terjadi karena endpoint default `/broadcasting/auth` menggunakan guard `web` (session), sementara SPA mobile login via Bearer token (`auth:sanctum`). Channel auth callback (`$user->id === $id`) return false karena user tidak terautentikasi di guard `web`.

**Fix:** Buat endpoint khusus di `routes/api.php` di bawah middleware `auth:sanctum`:

```php
Route::post('/broadcasting/auth', function (Request $request) {
    return Broadcast::auth($request);
});
```

SPA harus mengarahkan Echo ke endpoint ini (bukan default `/broadcasting/auth`).

**CORS:** `api/*` sudah ada di `config/cors.php` `paths`, jadi `/api/broadcasting/auth` otomatis tercover. Endpoint web `/broadcasting/auth` juga perlu ditambahkan manual.

### Order walk-in

Order yang dibuat oleh admin tanpa `user_id` (walk-in customer) tidak mengirim notifikasi ke user manapun (pengecekan `if ($ticketOrder->user_id)` sebelum dispatch/create).

### SPA Integration

**Echo config — pastikan `authEndpoint`指向 `/api/broadcasting/auth`:**

```typescript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: 'http://biwracean.test/api/broadcasting/auth',
    auth: {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
    },
});
```

Dua pendekatan yang bisa jalan bersamaan:

1. **Echo listener** — untuk realtime update badge/halaman:

    ```typescript
    Echo.private(`user.${userId}`).listen('.ticket-order.notification', (e) => {
        // update badge, refresh list
    });
    ```

2. **REST polling** — untuk initial load & fallback:
    ```
    GET /api/notifications/unread-count  → badge count
    GET /api/notifications              → history list
    POST /api/notifications/{id}/read   → mark as read
    POST /api/notifications/read-all    → mark all read
    ```
