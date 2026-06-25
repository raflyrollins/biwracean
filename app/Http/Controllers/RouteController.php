<?php

namespace App\Http\Controllers;

use App\Models\Port;
use App\Models\Route;
use App\Models\Ship;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RouteController extends Controller
{
    public function index(Request $request)
    {
        $query = Route::with(['ship', 'originPort', 'destinationPort']);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('ship', function ($sq) use ($search) {
                    $sq->whereFulltext(['name', 'hull_number', 'description'], $search);
                })->orWhereHas('originPort', function ($pq) use ($search) {
                    $pq->whereFulltext(['name', 'code', 'city', 'address'], $search);
                })->orWhereHas('destinationPort', function ($pq) use ($search) {
                    $pq->whereFulltext(['name', 'code', 'city', 'address'], $search);
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

        return Inertia::render('admin/routes/index', [
            'routes' => $query->latest()->paginate($perPage)->withQueryString(),
            'filters' => $request->only(['search', 'status', 'ship_id', 'per_page']),
            'ships' => Ship::where('status', 'active')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/routes/form', [
            'ships' => Ship::where('status', 'active')->get(),
            'ports' => Port::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ship_id' => 'required|exists:ships,id',
            'origin_port_id' => 'required|exists:ports,id',
            'destination_port_id' => 'required|exists:ports,id|different:origin_port_id',
            'base_price' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive',
        ]);

        Route::create($validated);

        return redirect()->route('admin.routes.index')
            ->with('success', 'Rute berhasil ditambahkan.');
    }

    public function edit(Route $route)
    {
        return Inertia::render('admin/routes/form', [
            'route' => $route,
            'ships' => Ship::where('status', 'active')->get(),
            'ports' => Port::all(),
        ]);
    }

    public function update(Request $request, Route $route)
    {
        $validated = $request->validate([
            'ship_id' => 'required|exists:ships,id',
            'origin_port_id' => 'required|exists:ports,id',
            'destination_port_id' => 'required|exists:ports,id|different:origin_port_id',
            'base_price' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive',
        ]);

        $route->update($validated);

        return redirect()->route('admin.routes.index')
            ->with('success', 'Rute berhasil diperbarui.');
    }

    public function destroy(Route $route)
    {
        $route->delete();

        return redirect()->route('admin.routes.index')
            ->with('success', 'Rute berhasil dihapus.');
    }
}
