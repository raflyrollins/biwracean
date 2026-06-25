<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $uuid
 * @property string $name
 * @property string $code
 * @property string $type
 * @property int|null $seat_count
 * @property int|null $bedroom_count
 * @property string|null $description
 * @property string|null $facilities
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'code', 'type', 'seat_count', 'bedroom_count', 'description', 'facilities'])]
class TicketClass extends Model
{
    protected $table = 'ticket_classes';

    protected static function booted(): void
    {
        static::creating(function (TicketClass $ticketClass) {
            $ticketClass->uuid = (string) Str::uuid();
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /** @return HasMany<TicketAvailability, $this> */
    public function ticketAvailabilities(): HasMany
    {
        return $this->hasMany(TicketAvailability::class, 'ticket_class_id');
    }
}
