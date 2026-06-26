<?php

namespace Database\Seeders;

use App\Models\Route;
use App\Models\TicketAvailability;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TicketAvailabilitySeeder extends Seeder
{
    public function run(): void
    {
        TicketAvailability::query()->delete();

        $today = Carbon::today();

        $routeClassPrices = [
            // Ship 1: KM. Bahari Express — Jakarta–Medan (route 1)
            1 => [
                1 => 175000, // Ekonomi
                2 => 315000, // Bisnis
                3 => 612500, // Eksekutif
                4 => 875000, // VIP
            ],
            // Ship 1: Medan–Denpasar (route 8)
            8 => [
                1 => 200000,
                2 => 360000,
                3 => 700000,
                4 => 1000000,
            ],
            // Ship 2: Surabaya–Makassar (route 3)
            3 => [
                1 => 250000,
                2 => 450000,
                3 => 875000,
                5 => 125000, // Motor
                6 => 350000, // Mobil
            ],
            // Ship 3: Jakarta–Surabaya (route 9)
            9 => [
                1 => 225000,
                2 => 405000,
                4 => 1125000,
            ],
            // Ship 3: Surabaya–Makassar (route 10)
            10 => [
                1 => 275000,
                2 => 495000,
                4 => 1375000,
            ],
            // Ship 3: Makassar–Batam (route 11)
            11 => [
                1 => 300000,
                2 => 540000,
                4 => 1500000,
            ],
            // Ship 4: Jakarta–Surabaya (route 7)
            7 => [
                5 => 150000, // Motor
                6 => 450000, // Mobil
            ],
        ];

        foreach ($routeClassPrices as $routeId => $classes) {
            $route = Route::with('ship.shipTicketClasses')->find($routeId);

            if (! $route) {
                continue;
            }

            foreach ($classes as $classId => $price) {
                $shipClass = $route->ship->shipTicketClasses
                    ->firstWhere('ticket_class_id', $classId);

                $stock = $shipClass?->seat_count ?? $shipClass?->bedroom_count ?? 100;

                // Create availability for 7 days starting from tomorrow
                for ($day = 1; $day <= 8; $day++) {
                    $date = $today->copy()->addDays($day)->format('Y-m-d');
                    $sold = max(0, min(rand(0, (int) ($stock * 0.6)), max($stock - 5, 1)));

                    TicketAvailability::create([
                        'route_id' => $routeId,
                        'ticket_class_id' => $classId,
                        'date' => $date,
                        'price' => $price,
                        'available_stock' => $stock,
                        'sold_stock' => $sold,
                    ]);
                }
            }
        }
    }
}
