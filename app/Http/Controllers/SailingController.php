<?php

namespace App\Http\Controllers;

use App\Models\Port;
use App\Models\Route;
use App\Models\Sailing;
use App\Models\SailingLeg;
use App\Models\Ship;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SailingController extends Controller
{
    public function index(Request $request)
    {
        $query = Sailing::with([
            'ship',
            'legs.originPort',
            'legs.destinationPort',
        ]);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereFulltext(['name'], $search)
                    ->orWhereHas('ship', function ($sq) use ($search) {
                        $sq->whereFulltext(['name', 'hull_number', 'description'], $search);
                    });
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($shipId = $request->get('ship_id')) {
            $query->where('ship_id', $shipId);
        }

        $perPage = min((int) $request->get('per_page', 10), 100);

        return Inertia::render('admin/sailings/index', [
            'sailings' => $query->orderBy('departure_date')->paginate($perPage)->withQueryString(),
            'filters' => $request->only(['search', 'status', 'ship_id', 'per_page']),
            'ships' => Ship::where('status', 'active')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/sailings/form', [
            'ships' => Ship::where('status', 'active')->get(),
            'ports' => Port::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ship_id' => 'required|exists:ships,id',
            'name' => 'required|string|max:255',
            'departure_date' => 'required|date',
            'arrival_date' => 'nullable|date|after_or_equal:departure_date',
            'status' => 'required|in:scheduled,in_progress,completed,cancelled',
            'port_ids' => 'required|array|min:2',
            'port_ids.*' => 'required|exists:ports,id',
            'departure_times' => 'nullable|array',
            'departure_times.*' => 'nullable|date_format:H:i',
            'arrival_times' => 'nullable|array',
            'arrival_times.*' => 'nullable|date_format:H:i',
        ]);

        $sailing = Sailing::create([
            'ship_id' => $validated['ship_id'],
            'name' => $validated['name'],
            'departure_date' => $validated['departure_date'],
            'arrival_date' => $validated['arrival_date'],
            'status' => $validated['status'],
        ]);

        $portIds = $validated['port_ids'];
        $departureTimes = $validated['departure_times'] ?? [];
        $arrivalTimes = $validated['arrival_times'] ?? [];

        for ($i = 0; $i < count($portIds) - 1; $i++) {
            $originId = (int) $portIds[$i];
            $destId = (int) $portIds[$i + 1];

            $route = Route::firstOrCreate(
                [
                    'ship_id' => $sailing->ship_id,
                    'origin_port_id' => $originId,
                    'destination_port_id' => $destId,
                ],
                [
                    'base_price' => 0,
                    'status' => 'active',
                ],
            );

            SailingLeg::create([
                'sailing_id' => $sailing->id,
                'origin_port_id' => $originId,
                'destination_port_id' => $destId,
                'route_id' => $route->id,
                'leg_order' => $i + 1,
                'departure_time' => $departureTimes[$i] ?? null,
                'arrival_time' => $arrivalTimes[$i] ?? null,
            ]);
        }

        return redirect()->route('admin.sailings.show', $sailing->uuid)
            ->with('success', 'Pelayaran berhasil dibuat.');
    }

    public function show(Sailing $sailing)
    {
        $departureDate = $sailing->departure_date;

        $sailing->load([
            'ship.shipTicketClasses.ticketClass',
            'legs.originPort',
            'legs.destinationPort',
            'legs.route.ticketAvailabilities' => function ($query) use ($departureDate) {
                $query->where('date', $departureDate);
            },
        ]);

        $legsWithStock = $sailing->legs->map(function ($leg) use ($sailing) {
            $availabilities = $leg->route?->ticketAvailabilities ?? collect();

            $classStock = collect();
            foreach ($sailing->ship->shipTicketClasses as $stc) {
                $soldForClass = $availabilities
                    ->where('ticket_class_id', $stc->ticket_class_id)
                    ->sum('sold_stock');
                $availableForClass = $availabilities
                    ->where('ticket_class_id', $stc->ticket_class_id)
                    ->sum('available_stock');

                $classStock->push([
                    'ticket_class_id' => $stc->ticket_class_id,
                    'ticket_class_name' => $stc->ticketClass->name,
                    'sold' => $soldForClass,
                    'available' => $availableForClass,
                ]);
            }

            return [
                'id' => $leg->id,
                'leg_order' => $leg->leg_order,
                'origin' => $leg->originPort,
                'destination' => $leg->destinationPort,
                'departure_time' => $leg->departure_time,
                'arrival_time' => $leg->arrival_time,
                'route_uuid' => $leg->route?->uuid,
                'class_stock' => $classStock,
                'ticket_availabilities_count' => $availabilities->count(),
            ];
        });

        $classStockSummary = [];
        foreach ($sailing->ship->shipTicketClasses as $stc) {
            $totalSold = 0;
            $totalAvailable = 0;
            foreach ($sailing->legs as $leg) {
                $availabilities = $leg->route?->ticketAvailabilities ?? collect();
                $totalSold += $availabilities
                    ->where('ticket_class_id', $stc->ticket_class_id)
                    ->sum('sold_stock');
                $totalAvailable += $availabilities
                    ->where('ticket_class_id', $stc->ticket_class_id)
                    ->sum('available_stock');
            }

            $capacity = $stc->seat_count ?? $stc->bedroom_count ?? 0;
            $classStockSummary[] = [
                'ticket_class_id' => $stc->ticket_class_id,
                'ticket_class_name' => $stc->ticketClass->name,
                'capacity' => $capacity,
                'total_sold' => $totalSold,
                'total_available' => $totalAvailable,
            ];
        }

        return Inertia::render('admin/sailings/show', [
            'sailing' => $sailing,
            'legsWithStock' => $legsWithStock,
            'classStockSummary' => $classStockSummary,
        ]);
    }

    public function edit(Sailing $sailing)
    {
        $sailing->load('legs');

        return Inertia::render('admin/sailings/form', [
            'sailing' => $sailing,
            'ships' => Ship::where('status', 'active')->get(),
            'ports' => Port::all(),
        ]);
    }

    public function update(Request $request, Sailing $sailing)
    {
        $validated = $request->validate([
            'ship_id' => 'required|exists:ships,id',
            'name' => 'required|string|max:255',
            'departure_date' => 'required|date',
            'arrival_date' => 'nullable|date|after_or_equal:departure_date',
            'status' => 'required|in:scheduled,in_progress,completed,cancelled',
            'port_ids' => 'required|array|min:2',
            'port_ids.*' => 'required|exists:ports,id',
            'departure_times' => 'nullable|array',
            'departure_times.*' => 'nullable|date_format:H:i',
            'arrival_times' => 'nullable|array',
            'arrival_times.*' => 'nullable|date_format:H:i',
        ]);

        $sailing->update([
            'ship_id' => $validated['ship_id'],
            'name' => $validated['name'],
            'departure_date' => $validated['departure_date'],
            'arrival_date' => $validated['arrival_date'],
            'status' => $validated['status'],
        ]);

        $sailing->legs()->delete();

        $portIds = $validated['port_ids'];
        $departureTimes = $validated['departure_times'] ?? [];
        $arrivalTimes = $validated['arrival_times'] ?? [];

        for ($i = 0; $i < count($portIds) - 1; $i++) {
            $originId = (int) $portIds[$i];
            $destId = (int) $portIds[$i + 1];

            $route = Route::firstOrCreate(
                [
                    'ship_id' => $sailing->ship_id,
                    'origin_port_id' => $originId,
                    'destination_port_id' => $destId,
                ],
                [
                    'base_price' => 0,
                    'status' => 'active',
                ],
            );

            SailingLeg::create([
                'sailing_id' => $sailing->id,
                'origin_port_id' => $originId,
                'destination_port_id' => $destId,
                'route_id' => $route->id,
                'leg_order' => $i + 1,
                'departure_time' => $departureTimes[$i] ?? null,
                'arrival_time' => $arrivalTimes[$i] ?? null,
            ]);
        }

        return redirect()->route('admin.sailings.show', $sailing->uuid)
            ->with('success', 'Pelayaran berhasil diperbarui.');
    }

    public function destroy(Sailing $sailing)
    {
        $sailing->delete();

        return redirect()->route('admin.sailings.index')
            ->with('success', 'Pelayaran berhasil dihapus.');
    }
}
