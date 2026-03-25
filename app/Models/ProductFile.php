<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable(['product_id', 'url', 'filename', 'file_size', 'mime_type'])]
class ProductFile extends Model
{
    protected static function boot(): void
    {
        parent::boot();

        static::deleting(function (ProductFile $file): void {
            $path = ltrim((string) parse_url($file->url, PHP_URL_PATH), '/');

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
