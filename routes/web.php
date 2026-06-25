<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PortController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RouteController;
use App\Http\Controllers\SailingController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ShipController;
use App\Http\Controllers\TicketAvailabilityController;
use App\Http\Controllers\TicketClassController;
use App\Http\Controllers\TicketOrderController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('public/landing');
})->name('home');

Route::get('/jadwal', [ScheduleController::class, 'index'])->name('schedule');

Route::middleware('guest')->group(function () {
    Route::get('/admin/login', [AuthController::class, 'create'])->name('admin.login');
    Route::post('/admin/login', [AuthController::class, 'store'])->name('admin.login.store');
});

Route::middleware('auth:web')->group(function () {
    Route::post('/admin/logout', [AuthController::class, 'destroy'])->name('admin.logout');
});

Route::middleware(['auth:web', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('/ships', ShipController::class)
        ->except('show')
        ->names(['index' => 'ships.index', 'create' => 'ships.create', 'store' => 'ships.store', 'edit' => 'ships.edit', 'update' => 'ships.update', 'destroy' => 'ships.destroy']);

    Route::resource('/ports', PortController::class)
        ->except('show')
        ->names(['index' => 'ports.index', 'create' => 'ports.create', 'store' => 'ports.store', 'edit' => 'ports.edit', 'update' => 'ports.update', 'destroy' => 'ports.destroy']);

    Route::resource('/routes', RouteController::class)
        ->except('show')
        ->names(['index' => 'routes.index', 'create' => 'routes.create', 'store' => 'routes.store', 'edit' => 'routes.edit', 'update' => 'routes.update', 'destroy' => 'routes.destroy']);

    Route::resource('/ticket-classes', TicketClassController::class)
        ->except('show')
        ->names(['index' => 'ticket-classes.index', 'create' => 'ticket-classes.create', 'store' => 'ticket-classes.store', 'edit' => 'ticket-classes.edit', 'update' => 'ticket-classes.update', 'destroy' => 'ticket-classes.destroy']);

    Route::resource('/ticket-availabilities', TicketAvailabilityController::class)
        ->except('show')
        ->names(['index' => 'ticket-availabilities.index', 'create' => 'ticket-availabilities.create', 'store' => 'ticket-availabilities.store', 'edit' => 'ticket-availabilities.edit', 'update' => 'ticket-availabilities.update', 'destroy' => 'ticket-availabilities.destroy']);

    Route::resource('/sailings', SailingController::class)
        ->except('show')
        ->names(['index' => 'sailings.index', 'create' => 'sailings.create', 'store' => 'sailings.store', 'edit' => 'sailings.edit', 'update' => 'sailings.update', 'destroy' => 'sailings.destroy']);
    Route::get('/sailings/{sailing}', [SailingController::class, 'show'])->name('sailings.show');

    Route::resource('/users', UserController::class)
        ->except('show')
        ->names(['index' => 'users.index', 'create' => 'users.create', 'store' => 'users.store', 'edit' => 'users.edit', 'update' => 'users.update', 'destroy' => 'users.destroy']);

    Route::resource('/roles', RoleController::class)
        ->except('show')
        ->names(['index' => 'roles.index', 'create' => 'roles.create', 'store' => 'roles.store', 'edit' => 'roles.edit', 'update' => 'roles.update', 'destroy' => 'roles.destroy']);

    Route::get('/ticket-orders', [TicketOrderController::class, 'index'])->name('ticket-orders.index');
    Route::post('/ticket-orders/{ticket_order}/validate', [TicketOrderController::class, 'validate'])->name('ticket-orders.validate');
    Route::post('/ticket-orders/{ticket_order}/cancel', [TicketOrderController::class, 'cancel'])->name('ticket-orders.cancel');

    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
});
