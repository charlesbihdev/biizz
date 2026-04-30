<?php

namespace App\Models;

use Database\Factories\BuyerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'phone', 'password', 'google_id', 'avatar', 'email_verified_at'])]
#[Hidden(['password', 'remember_token'])]
class Buyer extends Authenticatable
{
    /** @use HasFactory<BuyerFactory> */
    use HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /** @return HasMany<MarketplacePurchase, $this> */
    public function marketplacePurchases(): HasMany
    {
        return $this->hasMany(MarketplacePurchase::class);
    }
}
