<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('admin.ticket-orders', function (User $user) {
    return $user->is_admin;
});

Broadcast::channel('admin.ticket-stock', function (User $user) {
    return $user->is_admin;
});

Broadcast::channel('user.{id}', function (User $user, int $id) {
    return (int) $user->id === $id;
});
