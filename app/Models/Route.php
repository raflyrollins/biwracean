<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $uuid
 * @property int $ship_id
 * @property int $origin_port_id
 * @property int $destination_port_id
 * @property float $base_price
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Ship $ship
 * @property-read Port $originPort
 * @property-read Port $destinationPort
 */
#[Fillable(['ship_id', 'origin_port_id', 'destination_port_id', 'base_price', 'status'])]
class Route extends Model
{
    protected $table = 'routes';

    protected static function booted(): void
    {
        static::creating(function (Route $route) {
            $route->uuid = (string) Str::uuid();
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /** @return BelongsTo<Ship, $this> */
    public function ship(): BelongsTo
    {
        return $this->belongsTo(Ship::class, 'ship_id');
    }

    /** @return BelongsTo<Port, $this> */
    public function originPort(): BelongsTo
    {
        return $this->belongsTo(Port::class, 'origin_port_id');
    }

    /** @return BelongsTo<Port, $this> */
    public function destinationPort(): BelongsTo
    {
        return $this->belongsTo(Port::class, 'destination_port_id');
    }

    /** @return HasMany<TicketAvailability, $this> */
    public function ticketAvailabilities(): HasMany
    {
        return $this->hasMany(TicketAvailability::class, 'route_id');
    }
}
