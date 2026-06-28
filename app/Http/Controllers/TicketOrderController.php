<?php

namespace App\Http\Controllers;

use App\Events\PaymentProofUploaded;
use App\Events\TicketOrderCreated;
use App\Events\TicketOrderStatusChanged;
use App\Events\TicketStockUpdated;
use App\Models\Sailing;
use App\Models\SailingLeg;
use App\Models\TicketAvailability;
use App\Models\TicketClass;
use App\Models\TicketOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = TicketOrder::with([
            'sailing:id,uuid,name,departure_date',
            'sailingLeg.originPort:id,name',
            'sailingLeg.destinationPort:id,name',
            'ticketClass:id,name,code',
        ]);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('booking_code', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($dateFrom = $request->get('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->get('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $perPage = min((int) $request->get('per_page', 10), 100);

        return Inertia::render('admin/ticket-orders/index', [
            'orders' => $query->latest()->paginate($perPage)->withQueryString(),
            'filters' => $request->only(['search', 'per_page', 'status', 'date_from', 'date_to']),
        ]);
    }

    public function create()
    {
        $sailings = Sailing::with([
            'ship:id,name',
            'legs.originPort:id,name',
            'legs.destinationPort:id,name',
            'legs.route.ticketAvailabilities' => function ($q) {
                $q->whereDate('date', '>=', now()->format('Y-m-d'))
                    ->where('available_stock', '>', 0);
            },
            'legs.route.ticketAvailabilities.ticketClass:id,name,code',
        ])
            ->where('status', 'scheduled')
            ->whereDate('departure_date', '>=', now()->format('Y-m-d'))
            ->orderBy('departure_date')
            ->get();

        return Inertia::render('admin/ticket-orders/create', [
            'sailings' => $sailings,
            'ticketClasses' => TicketClass::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sailing_id' => 'required|exists:sailings,id',
            'sailing_leg_id' => 'required|exists:sailing_legs,id',
            'ticket_class_id' => 'required|exists:ticket_classes,id',
            'quantity' => 'required|integer|min:1|max:10',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'notes' => 'nullable|string|max:500',
        ]);

        $sailing = Sailing::where('id', $validated['sailing_id'])->firstOrFail();

        if ($sailing->status !== 'scheduled') {
            return back()->withErrors([
                'sailing_id' => 'Pelayaran tidak dapat dipesan.',
            ]);
        }

        $leg = SailingLeg::with('route')->where('id', $validated['sailing_leg_id'])->firstOrFail();

        $availability = TicketAvailability::where('route_id', $leg->route_id)
            ->where('ticket_class_id', $validated['ticket_class_id'])
            ->whereDate('date', '>=', now()->format('Y-m-d'))
            ->first();

        if (! $availability) {
            return back()->withErrors([
                'ticket_class_id' => 'Tiket tidak tersedia untuk rute dan kelas ini.',
            ]);
        }

        $remaining = $availability->remainingStock();

        if ($remaining < $validated['quantity']) {
            $msg = $remaining > 0
                ? "Stok tiket tidak mencukupi. Sisa: {$remaining} tiket."
                : 'Stok tiket habis.';

            return back()->withErrors(['quantity' => $msg]);
        }

        $totalPrice = $availability->price * $validated['quantity'];

        $order = TicketOrder::create([
            'sailing_id' => $validated['sailing_id'],
            'sailing_leg_id' => $validated['sailing_leg_id'],
            'ticket_class_id' => $validated['ticket_class_id'],
            'quantity' => $validated['quantity'],
            'total_price' => $totalPrice,
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        TicketOrderCreated::dispatch($order);

        return redirect()->route('admin.ticket-orders.index')
            ->with('success', "Tiket {$order->booking_code} berhasil dipesan.");
    }

    public function pay(TicketOrder $ticketOrder)
    {
        if ($ticketOrder->status !== 'pending') {
            return redirect()->back()
                ->with('success', "Tiket {$ticketOrder->booking_code} tidak dapat diproses.");
        }

        $leg = SailingLeg::with('route')->findOrFail($ticketOrder->sailing_leg_id);

        $availability = TicketAvailability::where('route_id', $leg->route_id)
            ->where('ticket_class_id', $ticketOrder->ticket_class_id)
            ->whereDate('date', '>=', now()->format('Y-m-d'))
            ->first();

        if ($availability) {
            if ($availability->remainingStock() < $ticketOrder->quantity) {
                return redirect()->back()
                    ->with('success', 'Stok tiket tidak mencukupi untuk memproses pembayaran.');
            }

            $availability->increment('sold_stock', $ticketOrder->quantity);
            TicketStockUpdated::dispatch($availability);
        }

        $oldStatus = $ticketOrder->status;
        $ticketOrder->update(['status' => 'paid']);
        TicketOrderStatusChanged::dispatch($ticketOrder, $oldStatus);

        return redirect()->back()
            ->with('success', "Tiket {$ticketOrder->booking_code} berhasil dibayar.");
    }

    public function validateOrder(TicketOrder $ticketOrder)
    {
        if ($ticketOrder->status === 'paid') {
            $oldStatus = $ticketOrder->status;
            $ticketOrder->update(['status' => 'validated']);
            TicketOrderStatusChanged::dispatch($ticketOrder, $oldStatus);

            return redirect()->back()
                ->with('success', "Tiket {$ticketOrder->booking_code} berhasil divalidasi.");
        }

        return redirect()->back()
            ->with('success', "Tiket {$ticketOrder->booking_code} tidak dapat divalidasi.");
    }

    public function cancel(TicketOrder $ticketOrder)
    {
        if (! in_array($ticketOrder->status, ['pending', 'paid'])) {
            return redirect()->back()
                ->with('success', "Tiket {$ticketOrder->booking_code} tidak dapat dibatalkan.");
        }

        if ($ticketOrder->status === 'paid') {
            $leg = SailingLeg::with('route')->findOrFail($ticketOrder->sailing_leg_id);

            $availability = TicketAvailability::where('route_id', $leg->route_id)
                ->where('ticket_class_id', $ticketOrder->ticket_class_id)
                ->whereDate('date', '>=', now()->format('Y-m-d'))
                ->first();

            if ($availability) {
                $availability->decrement('sold_stock', $ticketOrder->quantity);
                TicketStockUpdated::dispatch($availability);
            }
        }

        $oldStatus = $ticketOrder->status;
        $ticketOrder->update(['status' => 'cancelled']);
        TicketOrderStatusChanged::dispatch($ticketOrder, $oldStatus);

        return redirect()->back()
            ->with('success', "Tiket {$ticketOrder->booking_code} berhasil dibatalkan.");
    }

    public function uploadProof(Request $request, TicketOrder $ticketOrder): RedirectResponse
    {
        if (! in_array($ticketOrder->status, ['pending', 'paid'])) {
            return redirect()->back()
                ->with('success', "Tiket {$ticketOrder->booking_code} tidak dapat diupload bukti pembayaran.");
        }

        $request->validate([
            'payment_proof' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $path = $request->file('payment_proof')->store('payments', 'public');

        $ticketOrder->update(['payment_proof' => $path]);

        PaymentProofUploaded::dispatch($ticketOrder);

        return redirect()->back()
            ->with('success', 'Bukti pembayaran berhasil diupload.');
    }
}
