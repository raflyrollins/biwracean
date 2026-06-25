<?php

namespace App\Http\Controllers;

use App\Models\TicketOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = TicketOrder::with([
            'sailing:id,uuid,name,departure_date',
            'sailingLeg:id,origin_port_id,destination_port_id',
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

    public function validate(TicketOrder $ticketOrder)
    {
        if ($ticketOrder->status === 'paid') {
            $ticketOrder->update(['status' => 'validated']);

            return redirect()->back()
                ->with('success', "Tiket {$ticketOrder->booking_code} berhasil divalidasi.");
        }

        return redirect()->back()
            ->with('success', "Tiket {$ticketOrder->booking_code} tidak dapat divalidasi.");
    }

    public function cancel(TicketOrder $ticketOrder)
    {
        if (in_array($ticketOrder->status, ['pending', 'paid'])) {
            $ticketOrder->update(['status' => 'cancelled']);

            return redirect()->back()
                ->with('success', "Tiket {$ticketOrder->booking_code} berhasil dibatalkan.");
        }

        return redirect()->back()
            ->with('success', "Tiket {$ticketOrder->booking_code} tidak dapat dibatalkan.");
    }
}
