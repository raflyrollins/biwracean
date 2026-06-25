<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $uuid
 * @property int $route_id
 * @property int $ticket_class_id
 * @property string $date
 * @property float $price
 * @property int $available_stock
 * @property int $sold_stock
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Route $route
 * @property-read TicketClass $ticketClass
 */
#[Fillable(['route_id', 'ticket_class_id', 'date', 'price', 'available_stock', 'sold_stock'])]
class TicketAvailability extends Model
{
    protected $table = 'ticket_availabilities';

    protected static function booted(): void
    {
        static::creating(function (TicketAvailability $ticketAvailability) {
            $ticketAvailability->uuid = (string) Str::uuid();
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /** @return BelongsTo<Route, $this> */
    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class, 'route_id');
    }

    /** @return BelongsTo<TicketClass, $this> */
    public function ticketClass(): BelongsTo
    {
        return $this->belongsTo(TicketClass::class, 'ticket_class_id');
    }

    public function remainingStock(): int
    {
        return $this->available_stock - $this->sold_stock;
    }

    public function isAvailable(): bool
    {
        return $this->remainingStock() > 0;
    }
}
