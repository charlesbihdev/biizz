<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable(['product_id', 'url', 'path', 'filename', 'file_size', 'mime_type'])]
class ProductFile extends Model
{
    use HasFactory;

    protected static function boot(): void
    {
        parent::boot();

        static::deleting(function (ProductFile $file): void {
            if ($file->path) {
                Storage::disk('s3_private')->delete($file->path);
            }
        });
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
