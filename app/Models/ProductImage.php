<?php

namespace App\Models;

use Database\Factories\ProductImageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable(['product_id', 'url', 'alt', 'sort_order'])]
class ProductImage extends Model
{
    /** @use HasFactory<ProductImageFactory> */
    use HasFactory;

    protected static function boot(): void
    {
        parent::boot();

        static::deleting(function (ProductImage $image): void {
            $path = ltrim((string) parse_url($image->url, PHP_URL_PATH), '/');

            if ($path !== '') {
                Storage::disk('s3')->delete($path);
            }
        });
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
