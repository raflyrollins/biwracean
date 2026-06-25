<?php

namespace App\Http\Controllers;

use App\Models\Port;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PortController extends Controller
{
    public function index(Request $request)
    {
        $query = Port::query();

        if ($search = $request->get('search')) {
            $query->whereFulltext(['name', 'code', 'city', 'address'], $search);
        }

        $perPage = min((int) $request->get('per_page', 10), 100);

        return Inertia::render('admin/ports/index', [
            'ports' => $query->latest()->paginate($perPage)->withQueryString(),
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/ports/form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:ports,code',
            'city' => 'required|string|max:255',
            'address' => 'nullable|string',
        ]);

        Port::create($validated);

        return redirect()->route('admin.ports.index')
            ->with('success', 'Pelabuhan berhasil ditambahkan.');
    }

    public function edit(Port $port)
    {
        return Inertia::render('admin/ports/form', [
            'port' => $port,
        ]);
    }

    public function update(Request $request, Port $port)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:ports,code,'.$port->id,
            'city' => 'required|string|max:255',
            'address' => 'nullable|string',
        ]);

        $port->update($validated);

        return redirect()->route('admin.ports.index')
            ->with('success', 'Pelabuhan berhasil diperbarui.');
    }

    public function destroy(Port $port)
    {
        $port->delete();

        return redirect()->route('admin.ports.index')
            ->with('success', 'Pelabuhan berhasil dihapus.');
    }
}
