<?php

namespace App\Models;

use App\Enums\BusinessRole;
use Illuminate\Database\Eloquent\Relations\Pivot;

class BusinessUser extends Pivot
{
    public $timestamps = false; // Only has created_at, not updated_at

    protected function casts(): array
    {
        return [
            'role'       => BusinessRole::class,
            'created_at' => 'datetime',
        ];
    }
}
