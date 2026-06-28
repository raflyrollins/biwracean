<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property-read Collection<int, ShipTicketClass> $shipTicketClasses
 */

/**
 * @property int $id
 * @property string $uuid
 * @property string $name
 * @property string $hull_number
 * @property int $capacity
 * @property string $ship_type
 * @property string|null $description
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'hull_number', 'capacity', 'ship_type', 'description', 'status'])]
class Ship extends Model
{
    protected $table = 'ships';

    protected static function booted(): void
    {
        static::creating(function (Ship $ship) {
            $ship->uuid = (string) Str::uuid();
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /** @return HasMany<Route, $this> */
    public function routes(): HasMany
    {
        return $this->hasMany(Route::class, 'ship_id');
    }

    /** @return HasMany<ShipTicketClass, $this> */
    public function shipTicketClasses(): HasMany
    {
        return $this->hasMany(ShipTicketClass::class, 'ship_id');
    }

    /** @return Collection<int, TicketClass> */
    public function getTicketClassesAttribute()
    {
        return $this->shipTicketClasses->map(fn ($stc) => $stc->ticketClass);
    }
}
