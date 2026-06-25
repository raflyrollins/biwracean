<?php

namespace Database\Seeders;

use App\Models\Route;
use Illuminate\Database\Seeder;

class RouteSeeder extends Seeder
{
    public function run(): void
    {
        Route::create([
            'ship_id' => 1,
            'origin_port_id' => 1,
            'destination_port_id' => 3,
            'base_price' => 175000,
            'status' => 'active',
        ]);

        Route::create([
            'ship_id' => 1,
            'origin_port_id' => 3,
            'destination_port_id' => 1,
            'base_price' => 175000,
            'status' => 'active',
        ]);

        Route::create([
            'ship_id' => 2,
            'origin_port_id' => 2,
            'destination_port_id' => 4,
            'base_price' => 250000,
            'status' => 'active',
        ]);

        Route::create([
            'ship_id' => 2,
            'origin_port_id' => 4,
            'destination_port_id' => 2,
            'base_price' => 250000,
            'status' => 'active',
        ]);

        Route::create([
            'ship_id' => 3,
            'origin_port_id' => 5,
            'destination_port_id' => 6,
            'base_price' => 125000,
            'status' => 'active',
        ]);

        Route::create([
            'ship_id' => 3,
            'origin_port_id' => 6,
            'destination_port_id' => 5,
            'base_price' => 125000,
            'status' => 'active',
        ]);

        Route::create([
            'ship_id' => 4,
            'origin_port_id' => 1,
            'destination_port_id' => 2,
            'base_price' => 350000,
            'status' => 'active',
        ]);
    }
}
