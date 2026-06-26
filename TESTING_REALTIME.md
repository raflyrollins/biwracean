# Testing Real-time Features

## Services to Run

Open **3 separate terminals** and run:

| Terminal | Command | Description |
|----------|---------|-------------|
| 1 | `php artisan serve` (or Herd) | Laravel app server |
| 2 | `php artisan queue:listen` | Queue worker for broadcasting events |
| 3 | `php artisan reverb:start` | Reverb WebSocket server |
| *(optional)* | `npm run dev` | Vite for frontend hot-reload |

> **Note:** If you use **Laravel Herd**, the app server is already running at `http://biwracean.test`. You only need terminals 2 & 3.

## Real-time Test Workflow

### 1. Open Admin Dashboard
- Go to `http://biwracean.test/admin/login`
- Login as: `admin@biwracean.com` / `password` (or whatever password was set)
- You'll see the dashboard with the real-time notification bell

### 2. Register a Customer via Postman
- Use **Login** request with a customer email
- Or use **Register** to create a new customer
- Token auto-saves to Postman variable

### 3. Create an Order (triggers `TicketOrderCreated` event)
- First, call **List Sailings** → copy a `uuid` from the response
- Use that uuid in **Create Order** with quantity=2
- ✅ **Admin dashboard should flash a notification** within seconds

### 4. Pay the Order (triggers `TicketOrderStatusChanged` + `TicketStockUpdated`)
- Copy the order `uuid` from Create response
- Call **Pay Order**
- ✅ **Admin dashboard should update the order row** to "paid" status

### 5. Cancel the Order (triggers stock rollback + status change)
- Call **Cancel Order**
- ✅ Stock counter in dashboard should decrement

## Verifying Real-time Events

If the frontend doesn't update, check:

1. **Browser Console** (F12 → Console):
   - You should see: `[Echo] Listening on private-admin.ticket-orders`
   - If not, Echo didn't initialize — check `app.tsx`

2. **Reverb Terminal**: Should show WebSocket connections and event broadcasts

3. **Queue Terminal**: Should show `[2026-06-26 ...] Processing: App\Events\TicketOrderCreated`

## Quick Reverb Health Check

```bash
# Send a test event from tinker
php artisan tinker
> event(new App\Events\TicketOrderCreated(App\Models\TicketOrder::first()));
```

If Reverb is working, the admin dashboard notification bell will show a badge within seconds.
