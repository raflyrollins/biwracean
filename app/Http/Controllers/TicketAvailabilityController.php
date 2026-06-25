<?php

namespace App\Http\Controllers;

use App\Models\Route;
use App\Models\TicketAvailability;
use App\Models\TicketClass;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketAvailabilityController extends Controller
{
    public function index(Request $request)
    {
        $query = TicketAvailability::with([
            'route.ship',
            'route.originPort',
            'route.destinationPort',
            'ticketClass',
        ]);

        if ($routeUuid = $request->get('route_uuid')) {
            $routeIds = Route::where('uuid', $routeUuid)->pluck('id');
            $query->whereIn('route_id', $routeIds);
        }

        if ($ticketClassId = $request->get('ticket_class_id')) {
            $query->where('ticket_class_id', $ticketClassId);
        }

        if ($dateFrom = $request->get('date_from')) {
            $query->where('date', '>=', $dateFrom);
        }

        if ($dateTo = $request->get('date_to')) {
            $query->where('date', '<=', $dateTo);
        }

        if ($search = $request->get('search')) {
            $query->whereHas('route.ship', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('route.originPort', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('route.destinationPort', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->get('per_page', 10), 100);

        return Inertia::render('admin/ticket-availabilities/index', [
            'availabilities' => $query->latest()->paginate($perPage)->withQueryString(),
            'filters' => $request->only(['search', 'route_uuid', 'ticket_class_id', 'date_from', 'date_to', 'per_page']),
            'ticketClasses' => TicketClass::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/ticket-availabilities/form', [
            'routes' => Route::with(['ship.shipTicketClasses.ticketClass', 'originPort', 'destinationPort'])
                ->where('status', 'active')
                ->get(),
            'ticketClasses' => TicketClass::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'route_id' => 'required|exists:routes,id',
            'ticket_class_id' => 'required|exists:ticket_classes,id',
            'date' => 'required|date|after_or_equal:today',
            'price' => 'required|numeric|min:0',
            'available_stock' => 'required|integer|min:1',
        ]);

        $exists = TicketAvailability::where('route_id', $validated['route_id'])
            ->where('ticket_class_id', $validated['ticket_class_id'])
            ->where('date', $validated['date'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'date' => 'Ketersediaan tiket untuk rute, kelas, dan tanggal ini sudah ada.',
            ]);
        }

        $this->validateStockAcrossSailingLegs(
            $validated['route_id'],
            $validated['ticket_class_id'],
            $validated['date'],
            $validated['available_stock'],
        );

        TicketAvailability::create($validated);

        return redirect()->route('admin.ticket-availabilities.index')
            ->with('success', 'Ketersediaan tiket berhasil ditambahkan.');
    }

    public function edit(TicketAvailability $ticketAvailability)
    {
        return Inertia::render('admin/ticket-availabilities/form', [
            'availability' => $ticketAvailability->load(['route.ship.shipTicketClasses.ticketClass', 'route.originPort', 'route.destinationPort', 'ticketClass']),
            'routes' => Route::with(['ship.shipTicketClasses.ticketClass', 'originPort', 'destinationPort'])
                ->where('status', 'active')
                ->get(),
            'ticketClasses' => TicketClass::all(),
        ]);
    }

    public function update(Request $request, TicketAvailability $ticketAvailability)
    {
        $validated = $request->validate([
            'route_id' => 'required|exists:routes,id',
            'ticket_class_id' => 'required|exists:ticket_classes,id',
            'date' => 'required|date',
            'price' => 'required|numeric|min:0',
            'available_stock' => 'required|integer|min:1',
            'sold_stock' => 'required|integer|min:0',
        ]);

        $exists = TicketAvailability::where('route_id', $validated['route_id'])
            ->where('ticket_class_id', $validated['ticket_class_id'])
            ->where('date', $validated['date'])
            ->where('id', '!=', $ticketAvailability->id)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'date' => 'Ketersediaan tiket untuk rute, kelas, dan tanggal ini sudah ada.',
            ]);
        }

        $this->validateStockAcrossSailingLegs(
            $validated['route_id'],
            $validated['ticket_class_id'],
            $validated['date'],
            $validated['available_stock'],
            $ticketAvailability->id,
        );

        $ticketAvailability->update($validated);

        return redirect()->route('admin.ticket-availabilities.index')
            ->with('success', 'Ketersediaan tiket berhasil diperbarui.');
    }

    public function destroy(TicketAvailability $ticketAvailability)
    {
        $ticketAvailability->delete();

        return redirect()->route('admin.ticket-availabilities.index')
            ->with('success', 'Ketersediaan tiket berhasil dihapus.');
    }

    private function validateStockAcrossSailingLegs(
        int $routeId,
        int $ticketClassId,
        string $date,
        int $newStock,
        ?int $excludeAvailabilityId = null,
    ): void {
        $leg = SailingLeg::where('route_id', $routeId)->with('sailing.ship.shipTicketClasses')->first();

        if (! $leg) {
            return;
        }

        $sailing = $leg->sailing;
        $shipClass = $sailing->ship->shipTicketClasses
            ->firstWhere('ticket_class_id', $ticketClassId);

        if (! $shipClass) {
            return;
        }

        $maxCapacity = $shipClass->seat_count ?? $shipClass->bedroom_count;
        if (! $maxCapacity) {
            return;
        }

        $siblingRouteIds = SailingLeg::where('sailing_id', $sailing->id)
            ->where('route_id', '!=', $routeId)
            ->pluck('route_id')
            ->toArray();

        $existingStockQuery = TicketAvailability::whereIn('route_id', $siblingRouteIds)
            ->where('ticket_class_id', $ticketClassId)
            ->where('date', $date);

        if ($excludeAvailabilityId) {
            $existingStockQuery->where('id', '!=', $excludeAvailabilityId);
        }

        $totalExistingStock = $existingStockQuery->sum('available_stock');

        if ($totalExistingStock + $newStock > $maxCapacity) {
            $remaining = $maxCapacity - $totalExistingStock;

            abort(422, "Stok melebihi kapasitas kapal untuk kelas ini. Maksimal sisa stok yang bisa ditambahkan adalah {$remaining} (saat ini sudah terpakai {$totalExistingStock} dari {$maxCapacity}).");
        }
    }
}
