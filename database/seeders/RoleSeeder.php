<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $superadmin = Role::firstOrCreate(
            ['slug' => 'superadmin'],
            [
                'name' => 'Superadmin',
                'permissions' => ['*'],
            ],
        );

        User::where('email', 'admin@biwracean.com')->update(['role_id' => $superadmin->id]);

        Role::firstOrCreate(
            ['slug' => 'admin_tiket'],
            [
                'name' => 'Admin Tiket',
                'permissions' => [
                    'dashboard',
                    'ticket_classes',
                    'ticket_availabilities',
                    'ticket_orders',
                ],
            ],
        );

        Role::firstOrCreate(
            ['slug' => 'admin_kapal'],
            [
                'name' => 'Admin Kapal',
                'permissions' => [
                    'dashboard',
                    'ships',
                    'ports',
                    'routes',
                ],
            ],
        );

        Role::firstOrCreate(
            ['slug' => 'admin_operasional'],
            [
                'name' => 'Admin Operasional',
                'permissions' => [
                    'dashboard',
                    'ships',
                    'ports',
                    'routes',
                    'sailings',
                ],
            ],
        );

        Role::firstOrCreate(
            ['slug' => 'admin_keuangan'],
            [
                'name' => 'Admin Keuangan',
                'permissions' => [
                    'dashboard',
                    'sailings',
                    'ticket_availabilities',
                    'ticket_orders',
                ],
            ],
        );

        Role::firstOrCreate(
            ['slug' => 'admin_viewer'],
            [
                'name' => 'Viewer',
                'permissions' => [
                    'dashboard',
                    'ships',
                    'ports',
                    'routes',
                    'sailings',
                    'ticket_classes',
                    'ticket_availabilities',
                    'ticket_orders',
                ],
            ],
        );
    }
}
