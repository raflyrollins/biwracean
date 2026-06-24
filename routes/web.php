<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('public/landing');
})->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/admin/login', [AuthController::class, 'create'])->name('admin.login');
    Route::post('/admin/login', [AuthController::class, 'store'])->name('admin.login.store');
});

Route::middleware('auth:web')->group(function () {
    Route::post('/admin/logout', [AuthController::class, 'destroy'])->name('admin.logout');
});

Route::middleware(['auth:web', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::inertia('/dashboard', 'admin/dashboard')->name('dashboard');
});
