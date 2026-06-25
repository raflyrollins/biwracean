<?php

namespace App\Http\Controllers;

use App\Models\Port;
use App\Models\Route;
use App\Models\Ship;
use App\Models\TicketAvailability;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/dashboard', [
            'totalShips' => Ship::count(),
            'totalRoutes' => Route::count(),
            'totalPorts' => Port::count(),
            'totalUsers' => User::count(),
            'latestShips' => Ship::latest()->limit(5)->get(),
            'latestAvailabilities' => TicketAvailability::with(['route.ship', 'ticketClass'])
                ->latest()
                ->limit(5)
                ->get(),
        ]);
    }
}
