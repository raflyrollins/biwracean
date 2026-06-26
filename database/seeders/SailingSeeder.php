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
        SailingLeg::query()->delete();
        Sailing::query()->delete();

        $today = Carbon::today();

        /**
         * PAST SAILINGS (already departed)
         */
        $this->createSailing(1, 'KM. Bahari Express 1 — Jakarta–Denpasar PP', $today->copy()->subDays(2), $today->copy()->subDays(1), 'completed', [
            [1, 1, 3, '08:00', '14:00'],
            [2, 3, 5, '14:30', '20:00'],
        ]);

        $this->createSailing(2, 'KM. Samudera Jaya — Surabaya–Makassar', $today->copy()->subDays(1), $today, 'in_progress', [
            [1, 2, 4, '07:00', '18:00'],
        ]);

        $this->createSailing(3, 'KM. Nusantara Indah — Jakarta–Batam', $today->copy()->subDays(3), $today, 'completed', [
            [1, 1, 2, '07:00', '12:00'],
            [2, 2, 4, '13:00', '18:00'],
            [3, 4, 6, '19:00', '06:00'],
        ]);

        /**
         * TODAY'S SAILINGS
         */
        $this->createSailing(1, 'KM. Bahari Express 1 — Jakarta–Medan', $today, $today, 'in_progress', [
            [1, 1, 3, '08:00', '16:00'],
        ]);

        $this->createSailing(2, 'KM. Samudera Jaya — Surabaya–Makassar', $today, $today->copy()->addDays(2), 'scheduled', [
            [1, 2, 4, '09:00', '20:00'],
        ]);

        /**
         * FUTURE SAILINGS (with ticket availability)
         */
        $this->createSailing(1, 'KM. Bahari Express 1 — Jakarta–Denpasar', $today->copy()->addDays(2), $today->copy()->addDays(4), 'scheduled', [
            [1, 1, 3, '08:00', '14:00'],
            [2, 3, 5, '14:30', '20:00'],
        ]);

        $this->createSailing(3, 'KM. Nusantara Indah — Jakarta–Batam', $today->copy()->addDays(4), $today->copy()->addDays(7), 'scheduled', [
            [1, 1, 2, '07:00', '12:00'],
            [2, 2, 4, '13:00', '18:00'],
            [3, 4, 6, '19:00', '06:00'],
        ]);

        $this->createSailing(2, 'KM. Samudera Jaya — Surabaya–Makassar', $today->copy()->addDays(5), $today->copy()->addDays(6), 'scheduled', [
            [1, 2, 4, '07:00', '18:00'],
        ]);

        $this->createSailing(4, 'KM. Logistik Nusantara — Jakarta–Surabaya', $today->copy()->addDays(3), $today->copy()->addDays(4), 'scheduled', [
            [1, 1, 2, '06:00', '14:00'],
        ]);

        $this->createSailing(1, 'KM. Bahari Express 1 — Jakarta–Denpasar', $today->copy()->addDays(7), $today->copy()->addDays(9), 'scheduled', [
            [1, 1, 3, '08:00', '14:00'],
            [2, 3, 5, '14:30', '20:00'],
        ]);
    }

    private function createSailing(
        int $shipId,
        string $name,
        Carbon $departureDate,
        Carbon $arrivalDate,
        string $status,
        array $legs,
    ): void {
        $sailing = Sailing::create([
            'ship_id' => $shipId,
            'name' => $name,
            'departure_date' => $departureDate->format('Y-m-d'),
            'arrival_date' => $arrivalDate->format('Y-m-d'),
            'status' => $status,
        ]);

        foreach ($legs as $leg) {
            $route = Route::firstOrCreate(
                [
                    'ship_id' => $shipId,
                    'origin_port_id' => $leg[1],
                    'destination_port_id' => $leg[2],
                ],
                [
                    'base_price' => 0,
                    'status' => 'active',
                ],
            );

            SailingLeg::create([
                'sailing_id' => $sailing->id,
                'origin_port_id' => $leg[1],
                'destination_port_id' => $leg[2],
                'route_id' => $route->id,
                'leg_order' => $leg[0],
                'departure_time' => $leg[3],
                'arrival_time' => $leg[4],
            ]);
        }
    }
}
