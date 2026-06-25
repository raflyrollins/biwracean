<?php

namespace App\Http\Controllers;

use App\Models\Ship;
use App\Models\ShipTicketClass;
use App\Models\TicketClass;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShipController extends Controller
{
    public function index(Request $request)
    {
        $query = Ship::with('shipTicketClasses.ticketClass');

        if ($search = $request->get('search')) {
            $query->whereFulltext(['name', 'hull_number', 'description'], $search);
        }

        if ($shipType = $request->get('ship_type')) {
            $query->where('ship_type', $shipType);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $perPage = min((int) $request->get('per_page', 10), 100);

        return Inertia::render('admin/ships/index', [
            'ships' => $query->latest()->paginate($perPage)->withQueryString(),
            'filters' => $request->only(['search', 'ship_type', 'status', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/ships/form', [
            'ticketClasses' => TicketClass::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'hull_number' => 'required|string|max:50|unique:ships,hull_number',
            'capacity' => 'required|integer|min:1',
            'ship_type' => 'required|in:passenger,cargo,vehicle_ferry,mixed',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'class_configs' => 'nullable|array',
            'class_configs.*.ticket_class_id' => 'required|exists:ticket_classes,id',
            'class_configs.*.seat_count' => 'nullable|integer|min:0',
            'class_configs.*.bedroom_count' => 'nullable|integer|min:0',
        ]);

        $ship = Ship::create($validated);

        if ($request->class_configs) {
            foreach ($request->class_configs as $config) {
                ShipTicketClass::create([
                    'ship_id' => $ship->id,
                    'ticket_class_id' => $config['ticket_class_id'],
                    'seat_count' => $config['seat_count'] ?: null,
                    'bedroom_count' => $config['bedroom_count'] ?: null,
                ]);
            }
        }

        return redirect()->route('admin.ships.index')
            ->with('success', 'Kapal berhasil ditambahkan.');
    }

    public function edit(Ship $ship)
    {
        $ship->load('shipTicketClasses.ticketClass');

        return Inertia::render('admin/ships/form', [
            'ship' => $ship,
            'ticketClasses' => TicketClass::all(),
        ]);
    }

    public function update(Request $request, Ship $ship)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'hull_number' => 'required|string|max:50|unique:ships,hull_number,'.$ship->id,
            'capacity' => 'required|integer|min:1',
            'ship_type' => 'required|in:passenger,cargo,vehicle_ferry,mixed',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'class_configs' => 'nullable|array',
            'class_configs.*.ticket_class_id' => 'required|exists:ticket_classes,id',
            'class_configs.*.seat_count' => 'nullable|integer|min:0',
            'class_configs.*.bedroom_count' => 'nullable|integer|min:0',
        ]);

        $ship->update($validated);

        $ship->shipTicketClasses()->delete();

        if ($request->class_configs) {
            foreach ($request->class_configs as $config) {
                ShipTicketClass::create([
                    'ship_id' => $ship->id,
                    'ticket_class_id' => $config['ticket_class_id'],
                    'seat_count' => $config['seat_count'] ?: null,
                    'bedroom_count' => $config['bedroom_count'] ?: null,
                ]);
            }
        }

        return redirect()->route('admin.ships.index')
            ->with('success', 'Kapal berhasil diperbarui.');
    }

    public function destroy(Ship $ship)
    {
        $ship->delete();

        return redirect()->route('admin.ships.index')
            ->with('success', 'Kapal berhasil dihapus.');
    }
}
