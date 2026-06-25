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
        $routeIds = [1, 2, 3, 5];
        $classIds = [1, 2, 3, 4];

        foreach ($routeIds as $routeId) {
            $route = Route::with('ship.shipTicketClasses')->find($routeId);
            if (! $route) {
                continue;
            }

            foreach ($classIds as $classId) {
                $shipClass = $route->ship->shipTicketClasses
                    ->firstWhere('ticket_class_id', $classId);

                for ($day = 0; $day < 7; $day++) {
                    $date = Carbon::now()->addDays($day)->format('Y-m-d');
                    $basePrice = match ($routeId) {
                        1, 2 => 175000,
                        3 => 250000,
                        5 => 125000,
                        default => 150000,
                    };

                    $price = match ($classId) {
                        1 => $basePrice,
                        2 => (int) ($basePrice * 1.8),
                        3 => (int) ($basePrice * 3.5),
                        4 => (int) ($basePrice * 5),
                        default => $basePrice,
                    };

                    $stock = $shipClass?->seat_count ?? $shipClass?->bedroom_count ?? 100;
                    $sold = max(0, min(rand(0, (int) ($stock * 0.8)), $stock - 1));

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
