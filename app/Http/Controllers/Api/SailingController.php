<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sailing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SailingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $month = (int) $request->get('month', date('m'));
        $year = (int) $request->get('year', date('Y'));

        $sailings = Sailing::with([
            'ship:id,name',
            'legs.originPort:id,name',
            'legs.destinationPort:id,name',
            'legs.route.ticketAvailabilities' => function ($q) use ($month, $year) {
                $q->whereYear('date', $year)->whereMonth('date', $month);
            },
            'legs.route.ticketAvailabilities.ticketClass:id,name,code',
        ])
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->whereYear('departure_date', $year)
            ->whereMonth('departure_date', $month)
            ->orderBy('departure_date')
            ->get();

        return response()->json(['data' => $sailings]);
    }

    public function show(Sailing $sailing): JsonResponse
    {
        $sailing->load([
            'ship:id,name,hull_number,capacity',
            'legs.originPort:id,name,city',
            'legs.destinationPort:id,name,city',
            'legs.route.ticketAvailabilities' => function ($q) {
                $q->whereDate('date', '>=', now()->format('Y-m-d'))
                    ->where('available_stock', '>', 0);
            },
            'legs.route.ticketAvailabilities.ticketClass:id,name,code',
        ]);

        return response()->json(['data' => $sailing]);
    }
}
