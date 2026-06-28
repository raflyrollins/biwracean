# DEBUG: Route data tidak muncul di response order

## Problem

Setelah `POST /api/ticket-orders` sukses, response tidak menyertakan `sailing_leg.route`.  
SPA yang membaca `order.sailing_leg.route` mendapat `null`.

## Root Cause

`App\Http\Controllers\Api\TicketOrderController` tidak me-load `sailingLeg.route` di eager load.

## Fix

Tambahkan `'sailingLeg.route:id,base_price'` ke semua `->load([...])` dan `->with([...])` di controller tersebut.

### Metode yang perlu diubah

| Method | Baris | Load type |
|--------|-------|-----------|
| `index()` | `with([...])` | Daftar pesanan |
| `store()` | `$order->load([...])` | Response booking |
| `show()` | `$order->load([...])` | Detail pesanan |
| `pay()` | `$order->fresh()->load([...])` | Konfirmasi bayar |
| `uploadProof()` | `$order->fresh()->load([...])` | Upload bukti |
| `validateOrder()` | `$order->fresh()->load([...])` | Validasi tiket |

### Sebelum

```php
'sailingLeg.originPort:id,name',
'sailingLeg.destinationPort:id,name',
'ticketClass:id,name,code',
```

### Sesudah

```php
'sailingLeg.originPort:id,name',
'sailingLeg.destinationPort:id,name',
'sailingLeg.route:id,base_price',
'ticketClass:id,name,code',
```

## Response berubah

Sebelum:

```json
"sailing_leg": {
    "origin_port": { "id": 1, "name": "Tanjung Priok" },
    "destination_port": { "id": 2, "name": "Surabaya" }
}
```

Sesudah:

```json
"sailing_leg": {
    "origin_port": { "id": 1, "name": "Tanjung Priok" },
    "destination_port": { "id": 2, "name": "Surabaya" },
    "route": { "id": 1, "base_price": 175000 }
}
```

## TypeScript (SPA)

Tambahkan `route` di interface:

```typescript
interface TicketOrder {
    // ... existing fields
    sailing_leg?: {
        id: number;
        origin_port: Port;
        destination_port: Port;
        route: { id: number; base_price: number }; // <-- tambah ini
    };
}
```

---

# DEBUG: Tiket sailing in_progress masih bisa dipesan

## Problem

`POST /api/ticket-orders` dan admin `POST /admin/ticket-orders` menerima booking untuk sailing
berstatus `in_progress` (sedang berlangsung) atau `completed`.

## Fix

### 1. API: `App\Http\Controllers\Api\TicketOrderController::store()`

Tambahkan pengecekan status setelah `$sailing` ditemukan, sebelum validasi leg:

```php
$sailing = Sailing::where('uuid', $validated['sailing_uuid'])->firstOrFail();

if ($sailing->status !== 'scheduled') {
    throw ValidationException::withMessages([
        'sailing_uuid' => ['Pelayaran tidak dapat dipesan.'],
    ]);
}
```

### 2. API: `App\Http\Controllers\Api\SailingController::index()`

Filter `in_progress` dari listing pelayaran publik agar tidak membingungkan:

```php
// sebelum
->whereIn('status', ['scheduled', 'in_progress'])

// sesudah
->where('status', 'scheduled')
```

### 3. Admin: `App\Http\Controllers\TicketOrderController::create()`

Filter `in_progress` dari dropdown pelayaran:

```php
// sebelum
->whereIn('status', ['scheduled', 'in_progress'])

// sesudah
->where('status', 'scheduled')
```

### 4. Admin: `App\Http\Controllers\TicketOrderController::store()`

Tambahkan pengecekan status sailing:

```php
$sailing = Sailing::where('id', $validated['sailing_id'])->firstOrFail();

if ($sailing->status !== 'scheduled') {
    return back()->withErrors([
        'sailing_id' => 'Pelayaran tidak dapat dipesan.',
    ]);
}
```
