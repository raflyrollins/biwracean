<?php

namespace Database\Seeders;

use App\Models\Route;
use App\Models\Sailing;
use App\Models\SailingLeg;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class SailingSeeder extends Seeder
{
    public function run(): void
    {
        $sailing1 = Sailing::create([
            'ship_id' => 1,
            'name' => 'KM. Bahari Express 1 — Jakarta–Surabaya PP',
            'departure_date' => Carbon::now()->addDays(3)->format('Y-m-d'),
            'arrival_date' => Carbon::now()->addDays(5)->format('Y-m-d'),
            'status' => 'scheduled',
        ]);

        $this->createLeg($sailing1->id, 1, 1, 3, '08:00', '14:00');
        $this->createLeg($sailing1->id, 2, 3, 5, '14:30', '20:00');

        $sailing2 = Sailing::create([
            'ship_id' => 3,
            'name' => 'KM. Nusantara Indah — Jakarta–Makassar',
            'departure_date' => Carbon::now()->addDays(7)->format('Y-m-d'),
            'arrival_date' => Carbon::now()->addDays(10)->format('Y-m-d'),
            'status' => 'scheduled',
        ]);

        $this->createLeg($sailing2->id, 1, 1, 2, '07:00', '12:00');
        $this->createLeg($sailing2->id, 2, 2, 4, '13:00', '18:00');
        $this->createLeg($sailing2->id, 3, 4, 6, '19:00', '06:00');
    }

    private function createLeg(
        int $sailingId,
        int $order,
        int $originId,
        int $destId,
        string $departureTime,
        string $arrivalTime,
    ): void {
        $sailing = Sailing::find($sailingId);
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
            'sailing_id' => $sailingId,
            'origin_port_id' => $originId,
            'destination_port_id' => $destId,
            'route_id' => $route->id,
            'leg_order' => $order,
            'departure_time' => $departureTime,
            'arrival_time' => $arrivalTime,
        ]);
    }
}
