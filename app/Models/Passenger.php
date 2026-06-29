<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $ticket_order_id
 * @property string $name
 * @property string $nik
 * @property string $gender
 * @property string $date_of_birth
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read TicketOrder $ticketOrder
 */
#[Fillable(['ticket_order_id', 'name', 'nik', 'gender', 'date_of_birth'])]
class Passenger extends Model
{
    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date:Y-m-d',
        ];
    }

    /** @return BelongsTo<TicketOrder, $this> */
    public function ticketOrder(): BelongsTo
    {
        return $this->belongsTo(TicketOrder::class);
    }
}
