<?php

namespace App\Http\Controllers\Api;

use App\Events\TicketOrderCreated;
use App\Events\TicketOrderStatusChanged;
use App\Events\TicketStockUpdated;
use App\Http\Controllers\Controller;
use App\Models\Sailing;
use App\Models\SailingLeg;
use App\Models\TicketAvailability;
use App\Models\TicketOrder;
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
            'ticketClass:id,name,code',
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
            'quantity' => 'required|integer|min:1|max:10',
            'notes' => 'nullable|string|max:500',
        ]);

        $sailing = Sailing::where('uuid', $validated['sailing_uuid'])->firstOrFail();
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

        if ($remaining < $validated['quantity']) {
            $msg = $remaining > 0
                ? "Stok tiket tidak mencukupi. Sisa: {$remaining} tiket."
                : 'Stok tiket habis.';

            throw ValidationException::withMessages(['quantity' => [$msg]]);
        }

        $totalPrice = $availability->price * $validated['quantity'];

        $order = TicketOrder::create([
            'user_id' => $request->user()->id,
            'sailing_id' => $sailing->id,
            'sailing_leg_id' => $validated['sailing_leg_id'],
            'ticket_class_id' => $validated['ticket_class_id'],
            'quantity' => $validated['quantity'],
            'total_price' => $totalPrice,
            'customer_name' => $request->user()->name,
            'customer_email' => $request->user()->email,
            'customer_phone' => $request->user()->phone ?? '',
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        TicketOrderCreated::dispatch($order);

        $order->load([
            'sailing:id,uuid,name,departure_date',
            'sailingLeg.originPort:id,name',
            'sailingLeg.destinationPort:id,name',
            'ticketClass:id,name,code',
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
            'ticketClass:id,name,code',
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

        return response()->json([
            'message' => 'Pembayaran berhasil.',
            'data' => $order->fresh()->load([
                'sailing:id,uuid,name,departure_date',
                'sailingLeg.originPort:id,name',
                'sailingLeg.destinationPort:id,name',
                'ticketClass:id,name,code',
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

        return response()->json([
            'message' => 'Tiket berhasil divalidasi.',
            'data' => $order->fresh()->load([
                'sailing:id,uuid,name,departure_date',
                'sailingLeg.originPort:id,name',
                'sailingLeg.destinationPort:id,name',
                'ticketClass:id,name,code',
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

        return response()->json([
            'message' => 'Pesanan dibatalkan.',
            'data' => $order->fresh(),
        ]);
    }
}
