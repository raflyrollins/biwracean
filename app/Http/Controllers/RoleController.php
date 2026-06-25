<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/roles/index', [
            'roles' => Role::orderBy('name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/roles/form', [
            'permissionList' => $this->permissionOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:roles,slug',
            'permissions' => 'required|array',
            'permissions.*' => 'string',
        ]);

        Role::create($validated);

        return redirect()->route('admin.roles.index')
            ->with('success', 'Role berhasil ditambahkan.');
    }

    public function edit(Role $role)
    {
        return Inertia::render('admin/roles/form', [
            'role' => $role,
            'permissionList' => $this->permissionOptions(),
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:roles,slug,'.$role->id,
            'permissions' => 'required|array',
            'permissions.*' => 'string',
        ]);

        $role->update($validated);

        return redirect()->route('admin.roles.index')
            ->with('success', 'Role berhasil diperbarui.');
    }

    public function destroy(Role $role)
    {
        if ($role->slug === 'superadmin') {
            return redirect()->route('admin.roles.index')
                ->with('success', 'Role superadmin tidak dapat dihapus.');
        }

        $role->users()->update(['role_id' => null]);
        $role->delete();

        return redirect()->route('admin.roles.index')
            ->with('success', 'Role berhasil dihapus.');
    }

    private function permissionOptions(): array
    {
        return [
            ['key' => 'dashboard', 'label' => 'Dashboard', 'group' => 'Umum'],
            ['key' => 'ships', 'label' => 'Data Kapal', 'group' => 'Master Data'],
            ['key' => 'ports', 'label' => 'Pelabuhan', 'group' => 'Master Data'],
            ['key' => 'routes', 'label' => 'Rute', 'group' => 'Master Data'],
            ['key' => 'sailings', 'label' => 'Pelayaran', 'group' => 'Operasional'],
            ['key' => 'ticket_classes', 'label' => 'Kelas Tiket', 'group' => 'Tiket'],
            ['key' => 'ticket_availabilities', 'label' => 'Ketersediaan Tiket', 'group' => 'Tiket'],
            ['key' => 'ticket_orders', 'label' => 'Penjualan Tiket', 'group' => 'Tiket'],
            ['key' => 'users', 'label' => 'Pengguna', 'group' => 'Pengaturan'],
            ['key' => 'roles', 'label' => 'Role', 'group' => 'Pengaturan'],
            ['key' => 'settings', 'label' => 'Pengaturan', 'group' => 'Pengaturan'],
        ];
    }
}
