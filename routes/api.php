<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SailingController as ApiSailingController;
use App\Http\Controllers\Api\TicketOrderController as ApiTicketOrderController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/sailings', [ApiSailingController::class, 'index']);
Route::get('/sailings/{sailing}', [ApiSailingController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/ticket-orders', [ApiTicketOrderController::class, 'index']);
    Route::post('/ticket-orders', [ApiTicketOrderController::class, 'store']);
    Route::get('/ticket-orders/{order}', [ApiTicketOrderController::class, 'show']);
    Route::post('/ticket-orders/{order}/pay', [ApiTicketOrderController::class, 'pay']);
    Route::post('/ticket-orders/{order}/upload-proof', [ApiTicketOrderController::class, 'uploadProof']);
    Route::post('/ticket-orders/{order}/validate', [ApiTicketOrderController::class, 'validateOrder']);
    Route::post('/ticket-orders/{order}/cancel', [ApiTicketOrderController::class, 'cancel']);
});
