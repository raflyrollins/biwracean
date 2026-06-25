<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $ship_id
 * @property int $ticket_class_id
 * @property int|null $seat_count
 * @property int|null $bedroom_count
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Ship $ship
 * @property-read TicketClass $ticketClass
 */
#[Fillable(['ship_id', 'ticket_class_id', 'seat_count', 'bedroom_count'])]
class ShipTicketClass extends Model
{
    protected $table = 'ship_ticket_class';

    /** @return BelongsTo<Ship, $this> */
    public function ship(): BelongsTo
    {
        return $this->belongsTo(Ship::class, 'ship_id');
    }

    /** @return BelongsTo<TicketClass, $this> */
    public function ticketClass(): BelongsTo
    {
        return $this->belongsTo(TicketClass::class, 'ticket_class_id');
    }
}
