<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $sailing_id
 * @property int $origin_port_id
 * @property int $destination_port_id
 * @property int|null $route_id
 * @property int $leg_order
 * @property string|null $departure_time
 * @property string|null $arrival_time
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Sailing $sailing
 * @property-read Port $originPort
 * @property-read Port $destinationPort
 * @property-read Route|null $route
 */
#[Fillable(['sailing_id', 'origin_port_id', 'destination_port_id', 'route_id', 'leg_order', 'departure_time', 'arrival_time'])]
class SailingLeg extends Model
{
    protected $table = 'sailing_legs';

    /** @return BelongsTo<Sailing, $this> */
    public function sailing(): BelongsTo
    {
        return $this->belongsTo(Sailing::class, 'sailing_id');
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

    /** @return BelongsTo<Route, $this> */
    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class, 'route_id');
    }
}
