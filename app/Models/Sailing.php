<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $uuid
 * @property int $ship_id
 * @property string $name
 * @property string $departure_date
 * @property string|null $arrival_date
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Ship $ship
 * @property-read Collection<int, SailingLeg> $legs
 */
#[Fillable(['ship_id', 'name', 'departure_date', 'arrival_date', 'status'])]
class Sailing extends Model
{
    protected $table = 'sailings';

    protected static function booted(): void
    {
        static::creating(function (Sailing $sailing) {
            $sailing->uuid = (string) Str::uuid();
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

    /** @return HasMany<SailingLeg, $this> */
    public function legs(): HasMany
    {
        return $this->hasMany(SailingLeg::class, 'sailing_id')->orderBy('leg_order');
    }
}
