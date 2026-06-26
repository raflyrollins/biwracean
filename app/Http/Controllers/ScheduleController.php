<?php

namespace App\Http\Controllers;

use App\Models\Sailing;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $month = (int) $request->get('month', date('m'));
        $year = (int) $request->get('year', date('Y'));

        $sailings = Sailing::with([
            'ship.shipTicketClasses.ticketClass',
            'legs.originPort',
            'legs.destinationPort',
            'legs.route.ticketAvailabilities' => function ($q) use ($month, $year) {
                $q->whereYear('date', $year)->whereMonth('date', $month)->with('ticketClass');
            },
        ])
            ->whereYear('departure_date', $year)
            ->whereMonth('departure_date', $month)
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->orderBy('departure_date')
            ->get();

        $grouped = [];
        foreach ($sailings as $sailing) {
            $legs = $sailing->legs->map(function ($leg) {
                $availabilities = $leg->route?->ticketAvailabilities ?? collect();

                $classes = $availabilities
                    ->groupBy('ticket_class_id')
                    ->map(function ($group) {
                        $first = $group->first();

                        return [
                            'ticket_class_id' => $first->ticket_class_id,
                            'ticket_class_name' => $first->ticketClass?->name,
                            'price' => $first->price,
                            'available_stock' => $first->available_stock,
                        ];
                    })
                    ->values();

                return [
                    'origin' => $leg->originPort?->name,
                    'destination' => $leg->destinationPort?->name,
                    'departure_time' => $leg->departure_time,
                    'arrival_time' => $leg->arrival_time,
                    'classes' => $classes,
                ];
            });

            $grouped[$sailing->departure_date][] = [
                'uuid' => $sailing->uuid,
                'name' => $sailing->name,
                'ship_name' => $sailing->ship?->name,
                'ship' => [
                    'name' => $sailing->ship?->name,
                    'hull_number' => $sailing->ship?->hull_number,
                ],
                'legs' => $legs,
            ];
        }

        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);

        return Inertia::render('admin/schedule', [
            'grouped' => $grouped,
            'month' => $month,
            'year' => $year,
            'daysInMonth' => $daysInMonth,
            'firstDayOfWeek' => (int) date('w', strtotime("{$year}-{$month}-01")),
        ]);
    }
}
