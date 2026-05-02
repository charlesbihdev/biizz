<?php

namespace App\Services\Subscription;

use App\Models\Business;
use App\Models\ProductFile;

/**
 * Read-and-enforce helper for the digital file storage tier limits.
 *
 * Storage budget covers ProductFile rows only (the seller's uploaded
 * digital good: PDFs, ZIPs, EPUBs delivered to buyers). It does not
 * count storefront images, logos, or theme media. See ROADMAP.md and
 * config/biizz.php for the contract.
 */
final class DigitalStorageService
{
    /**
     * Sum of bytes already consumed by digital files for the business.
     * Joins through products since ProductFile is owned via product_id.
     */
    public static function usedBytes(Business $business): int
    {
        return (int) ProductFile::query()
            ->whereHas('product', fn ($q) => $q->where('business_id', $business->id))
            ->sum('file_size');
    }

    /**
     * Total bytes the business may store. `null` = unlimited.
     */
    public static function quotaBytes(Business $business): ?int
    {
        return FeatureAccess::limit($business, 'max_digital_storage_bytes');
    }

    /**
     * Maximum size of a single uploaded file. `null` = no per-file cap.
     */
    public static function perFileMaxBytes(Business $business): ?int
    {
        return FeatureAccess::limit($business, 'max_digital_file_bytes');
    }
}
