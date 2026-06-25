<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(['email' => 'admin@biwracean.com'], [
            'name' => 'Admin Biwracean',
            'password' => bcrypt('password'),
            'is_admin' => true,
        ]);

        $this->call([
            RoleSeeder::class,
            TicketClassSeeder::class,
            PortSeeder::class,
            ShipSeeder::class,
            RouteSeeder::class,
            SailingSeeder::class,
            TicketAvailabilitySeeder::class,
        ]);
    }
}
