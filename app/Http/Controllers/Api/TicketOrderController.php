<?php

namespace App\Http\Controllers\Api;

use App\Events\PaymentProofUploaded;
use App\Events\TicketOrderCreated;
use App\Events\TicketOrderStatusChanged;
use App\Events\TicketOrderUserNotification;
use App\Events\TicketStockUpdated;
use App\Http\Controllers\Controller;
use App\Models\Sailing;
use App\Models\SailingLeg;
use App\Models\TicketAvailability;
use App\Models\TicketOrder;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TicketOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = TicketOrder::with([
            'sailing:id,uuid,name,departure_date',
            'sailingLeg.originPort:id,name',
            'sailingLeg.destinationPort:id,name',
            'sailingLeg.route:id,base_price',
            'ticketClass:id,name,code',
            'passengers',
        ])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['data' => $orders]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sailing_uuid' => 'required|string|exists:sailings,uuid',
            'sailing_leg_id' => 'required|integer|exists:sailing_legs,id',
            'ticket_class_id' => 'required|integer|exists:ticket_classes,id',
            'notes' => 'nullable|string|max:500',
            'passengers' => 'required|array|min:1',
            'passengers.*.name' => 'required|string|max:255',
            'passengers.*.nik' => 'required|string|max:20',
            'passengers.*.gender' => 'required|string|in:L,P',
            'passengers.*.date_of_birth' => 'required|date',
        ]);

        $quantity = count($validated['passengers']);

        if ($quantity < 1 || $quantity > 10) {
            throw ValidationException::withMessages([
                'passengers' => ['Jumlah penumpang harus antara 1 sampai 10.'],
            ]);
        }

        $sailing = Sailing::where('uuid', $validated['sailing_uuid'])->firstOrFail();

        if ($sailing->status !== 'scheduled') {
            throw ValidationException::withMessages([
                'sailing_uuid' => ['Pelayaran tidak dapat dipesan.'],
            ]);
        }

        $leg = SailingLeg::with('route')->where('id', $validated['sailing_leg_id'])->firstOrFail();

        if ($leg->sailing_id !== $sailing->id) {
            throw ValidationException::withMessages([
                'sailing_leg_id' => ['Leg tidak sesuai dengan pelayaran yang dipilih.'],
            ]);
        }

        $availability = TicketAvailability::where('route_id', $leg->route_id)
            ->where('ticket_class_id', $validated['ticket_class_id'])
            ->whereDate('date', '>=', now()->format('Y-m-d'))
            ->first();

        if (! $availability || ! $availability->isAvailable()) {
            throw ValidationException::withMessages([
                'ticket_class_id' => ['Tiket tidak tersedia untuk rute dan kelas ini.'],
            ]);
        }

        $remaining = $availability->remainingStock();

        if ($remaining < $quantity) {
            $msg = $remaining > 0
                ? "Stok tiket tidak mencukupi. Sisa: {$remaining} tiket."
                : 'Stok tiket habis.';

            throw ValidationException::withMessages(['quantity' => [$msg]]);
        }

        $totalPrice = $availability->price * $quantity;

        $order = TicketOrder::create([
            'user_id' => $request->user()->id,
            'sailing_id' => $sailing->id,
            'sailing_leg_id' => $validated['sailing_leg_id'],
            'ticket_class_id' => $validated['ticket_class_id'],
            'quantity' => $quantity,
            'total_price' => $totalPrice,
            'customer_name' => $request->user()->name,
            'customer_email' => $request->user()->email,
            'customer_phone' => $request->user()->phone ?? '',
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        foreach ($validated['passengers'] as $data) {
            $order->passengers()->create([
                'name' => $data['name'],
                'nik' => $data['nik'],
                'gender' => $data['gender'],
                'date_of_birth' => $data['date_of_birth'],
            ]);
        }

        TicketOrderCreated::dispatch($order);

        $order->load([
            'sailing:id,uuid,name,departure_date',
            'sailingLeg.originPort:id,name',
            'sailingLeg.destinationPort:id,name',
            'sailingLeg.route:id,base_price',
            'ticketClass:id,name,code',
            'passengers',
        ]);

        return response()->json(['data' => $order], 201);
    }

    public function show(Request $request, TicketOrder $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $order->load([
            'sailing:id,uuid,name,departure_date,arrival_date',
            'sailing.ship:id,name',
            'sailingLeg.originPort:id,name,city',
            'sailingLeg.destinationPort:id,name,city',
            'sailingLeg.route:id,base_price',
            'ticketClass:id,name,code',
            'passengers',
        ]);

        return response()->json(['data' => $order]);
    }

    public function pay(Request $request, TicketOrder $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Pesanan sudah diproses.'], 422);
        }

        $leg = SailingLeg::with('route')->where('id', $order->sailing_leg_id)->firstOrFail();

        $availability = TicketAvailability::where('route_id', $leg->route_id)
            ->where('ticket_class_id', $order->ticket_class_id)
            ->whereDate('date', '>=', now()->format('Y-m-d'))
            ->first();

        if ($availability) {
            if ($availability->remainingStock() < $order->quantity) {
                return response()->json(['message' => 'Stok tiket tidak mencukupi.'], 422);
            }

            $availability->increment('sold_stock', $order->quantity);
            TicketStockUpdated::dispatch($availability);
        }

        $oldStatus = $order->status;
        $order->update(['status' => 'paid']);

        TicketOrderStatusChanged::dispatch($order, $oldStatus);

        if ($order->user_id) {
            TicketOrderUserNotification::dispatch($order, $oldStatus);

            UserNotification::create([
                'user_id' => $order->user_id,
                'ticket_order_id' => $order->id,
                'type' => 'payment_confirmed',
                'message' => "Pembayaran tiket {$order->booking_code} telah dikonfirmasi",
            ]);
        }

        return response()->json([
            'message' => 'Pembayaran berhasil.',
            'data' => $order->fresh()->load([
                'sailing:id,uuid,name,departure_date',
                'sailingLeg.originPort:id,name',
                'sailingLeg.destinationPort:id,name',
                'sailingLeg.route:id,base_price',
                'ticketClass:id,name,code',
                'passengers',
            ]),
        ]);
    }

    public function uploadProof(Request $request, TicketOrder $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Pesanan sudah diproses.'], 422);
        }

        $validated = $request->validate([
            'payment_proof' => 'required|image|mimes:jpg,jpeg,png|max:5120',
        ]);

        $path = $request->file('payment_proof')->store('payments', 'public');

        $order->update(['payment_proof' => $path]);

        PaymentProofUploaded::dispatch($order);

        return response()->json([
            'message' => 'Bukti pembayaran berhasil diupload.',
            'data' => $order->fresh()->load([
                'sailing:id,uuid,name,departure_date',
                'sailingLeg.originPort:id,name',
                'sailingLeg.destinationPort:id,name',
                'sailingLeg.route:id,base_price',
                'ticketClass:id,name,code',
                'passengers',
            ]),
        ]);
    }

    public function validateOrder(Request $request, TicketOrder $order): JsonResponse
    {
        if ($request->user()->is_admin) {
            // admin can validate any order
        } elseif ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($order->status !== 'paid') {
            return response()->json(['message' => 'Hanya tiket berstatus dibayar yang bisa divalidasi.'], 422);
        }

        $oldStatus = $order->status;
        $order->update(['status' => 'validated']);

        TicketOrderStatusChanged::dispatch($order, $oldStatus);

        if ($order->user_id) {
            TicketOrderUserNotification::dispatch($order, $oldStatus);

            UserNotification::create([
                'user_id' => $order->user_id,
                'ticket_order_id' => $order->id,
                'type' => 'ticket_validated',
                'message' => "Tiket {$order->booking_code} telah divalidasi",
            ]);
        }

        return response()->json([
            'message' => 'Tiket berhasil divalidasi.',
            'data' => $order->fresh()->load([
                'sailing:id,uuid,name,departure_date',
                'sailingLeg.originPort:id,name',
                'sailingLeg.destinationPort:id,name',
                'sailingLeg.route:id,base_price',
                'ticketClass:id,name,code',
                'passengers',
            ]),
        ]);
    }

    public function cancel(Request $request, TicketOrder $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if (! in_array($order->status, ['pending', 'paid'])) {
            return response()->json(['message' => 'Pesanan tidak dapat dibatalkan.'], 422);
        }

        if ($order->status === 'paid') {
            $leg = SailingLeg::with('route')->where('id', $order->sailing_leg_id)->firstOrFail();

            $availability = TicketAvailability::where('route_id', $leg->route_id)
                ->where('ticket_class_id', $order->ticket_class_id)
                ->whereDate('date', '>=', now()->format('Y-m-d'))
                ->first();

            if ($availability) {
                $availability->decrement('sold_stock', $order->quantity);
                TicketStockUpdated::dispatch($availability);
            }
        }

        $oldStatus = $order->status;
        $order->update(['status' => 'cancelled']);

        TicketOrderStatusChanged::dispatch($order, $oldStatus);

        if ($order->user_id) {
            TicketOrderUserNotification::dispatch($order, $oldStatus);

            UserNotification::create([
                'user_id' => $order->user_id,
                'ticket_order_id' => $order->id,
                'type' => 'ticket_cancelled',
                'message' => "Tiket {$order->booking_code} telah dibatalkan",
            ]);
        }

        return response()->json([
            'message' => 'Pesanan dibatalkan.',
            'data' => $order->fresh()->load(['passengers']),
        ]);
    }
}
