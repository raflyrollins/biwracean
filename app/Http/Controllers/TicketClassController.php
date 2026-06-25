<?php

namespace App\Http\Controllers;

use App\Models\TicketClass;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketClassController extends Controller
{
    public function index(Request $request)
    {
        $query = TicketClass::query();

        if ($search = $request->get('search')) {
            $query->whereFulltext(['name', 'code', 'description'], $search);
        }

        if ($type = $request->get('type')) {
            $query->where('type', $type);
        }

        $perPage = min((int) $request->get('per_page', 10), 100);

        return Inertia::render('admin/ticket-classes/index', [
            'ticketClasses' => $query->latest()->paginate($perPage)->withQueryString(),
            'filters' => $request->only(['search', 'type', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/ticket-classes/form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:ticket_classes,code',
            'type' => 'required|in:seat,cabin',
            'seat_count' => 'nullable|integer|min:0',
            'bedroom_count' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'facilities' => 'nullable|string',
        ]);

        TicketClass::create($validated);

        return redirect()->route('admin.ticket-classes.index')
            ->with('success', 'Kelas tiket berhasil ditambahkan.');
    }

    public function edit(TicketClass $ticketClass)
    {
        return Inertia::render('admin/ticket-classes/form', [
            'ticketClass' => $ticketClass,
        ]);
    }

    public function update(Request $request, TicketClass $ticketClass)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:ticket_classes,code,'.$ticketClass->id,
            'type' => 'required|in:seat,cabin',
            'seat_count' => 'nullable|integer|min:0',
            'bedroom_count' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'facilities' => 'nullable|string',
        ]);

        $ticketClass->update($validated);

        return redirect()->route('admin.ticket-classes.index')
            ->with('success', 'Kelas tiket berhasil diperbarui.');
    }

    public function destroy(TicketClass $ticketClass)
    {
        $ticketClass->delete();

        return redirect()->route('admin.ticket-classes.index')
            ->with('success', 'Kelas tiket berhasil dihapus.');
    }
}
