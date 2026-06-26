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
 * @property int $sailing_id
 * @property int $sailing_leg_id
 * @property int $ticket_class_id
 * @property string $booking_code
 * @property int $quantity
 * @property float $total_price
 * @property string $customer_name
 * @property string $customer_email
 * @property string $customer_phone
 * @property string $status
 * @property int|null $user_id
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Sailing $sailing
 * @property-read SailingLeg $sailingLeg
 * @property-read TicketClass $ticketClass
 * @property-read User $user
 */
#[Fillable([
    'user_id',
    'sailing_id',
    'sailing_leg_id',
    'ticket_class_id',
    'quantity',
    'total_price',
    'customer_name',
    'customer_email',
    'customer_phone',
    'status',
    'notes',
])]
class TicketOrder extends Model
{
    protected static function booted(): void
    {
        static::creating(function (TicketOrder $order) {
            $order->uuid = (string) Str::uuid();
            $order->booking_code = static::generateBookingCode();
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function sailing(): BelongsTo
    {
        return $this->belongsTo(Sailing::class);
    }

    public function sailingLeg(): BelongsTo
    {
        return $this->belongsTo(SailingLeg::class);
    }

    public function ticketClass(): BelongsTo
    {
        return $this->belongsTo(TicketClass::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function generateBookingCode(): string
    {
        $prefix = 'BWR';
        $random = strtoupper(Str::random(6));
        $code = $prefix.$random;

        while (static::where('booking_code', $code)->exists()) {
            $code = $prefix.strtoupper(Str::random(6));
        }

        return $code;
    }
}
