<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property array $permissions
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'slug', 'permissions'])]
class Role extends Model
{
    protected function casts(): array
    {
        return [
            'permissions' => 'array',
        ];
    }

    public function hasPermission(string $permission): bool
    {
        if (in_array('*', $this->permissions, true)) {
            return true;
        }

        return in_array($permission, $this->permissions, true);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
