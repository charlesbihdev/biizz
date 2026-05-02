<?php

namespace App\Http\Requests\Admin;

use App\Models\Business;
use App\Services\Subscription\DigitalStorageService;
use App\Services\Subscription\FeatureAccess;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Business $business */
        $business = $this->route('business');

        return $business->isOwnedBy($this->user());
    }

    /**
     * Block creation when the business is at its tier-defined product cap,
     * and normalise any user-supplied slug to lowercase so the regex rule
     * never trips on accidental capitals. The frontend slugify() already
     * lowercases as you type, this is the safety net for raw API calls.
     *
     * See ANALYTICS_TIERS.md sections 1.2 and 1.3.
     */
    protected function prepareForValidation(): void
    {
        /** @var Business $business */
        $business = $this->route('business');

        if ($this->filled('slug')) {
            $this->merge(['slug' => Str::lower((string) $this->input('slug'))]);
        }

        $limit = FeatureAccess::limit($business, 'max_products');

        if ($limit !== null && $business->products()->count() >= $limit) {
            abort(402, "Product limit reached: upgrade to add more than {$limit} products.");
        }

        // Storage quota guard. The frontend pre-checks file size before the
        // upload starts, so a 402 here only fires for direct API calls or
        // bypass attempts. See DigitalStorageService for the contract.
        $incoming = $this->file('digital_file');

        if ($incoming !== null) {
            $quota = DigitalStorageService::quotaBytes($business);

            if ($quota !== null) {
                $used = DigitalStorageService::usedBytes($business);

                if ($used + $incoming->getSize() > $quota) {
                    abort(402, 'Storage quota exceeded: upgrade to upload more files.');
                }
            }
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        /** @var Business $business */
        $business = $this->route('business');
        $isDigital = $business->business_type === 'digital';
        $imageMax = FeatureAccess::limit($business, 'max_product_images') ?? 8;

        // Tier-aware per-file cap for digital uploads. Validator wants
        // kilobytes; convert from bytes. `null` (Pro/Pro Max) falls back to
        // a 5 GB sanity ceiling so a malformed upload cannot exhaust disk.
        $fileMaxBytes = DigitalStorageService::perFileMaxBytes($business);
        $fileMaxKilobytes = $fileMaxBytes !== null
            ? (int) ceil($fileMaxBytes / 1024)
            : 5 * 1024 * 1024;

        return [
            'category_id' => $isDigital
                ? ['nullable', 'integer', 'exists:categories,id']
                : ['required', 'integer', 'exists:categories,id'],
            'digital_category' => $isDigital
                ? ['required', 'string', Rule::in(['ebooks', 'courses', 'templates', 'coaching', 'playbooks', 'webinars', 'community', 'services', 'others'])]
                : ['nullable', 'string'],
            'delivery_mode' => $isDigital
                ? ['required', 'string', Rule::in(['reader', 'download', 'external_link'])]
                : ['nullable'],
            'external_url' => $isDigital
                ? ['required_if:delivery_mode,external_link', 'nullable', 'url', 'max:2048']
                : ['nullable'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9\-]+$/',
                Rule::unique('products')->where('business_id', $this->route('business')->id),
            ],
            'description' => ['nullable', 'string', 'max:50000'],
            'promo_video' => ['nullable', 'string', 'max:2048'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0', 'max:999999.99', 'gt:price'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'images' => $isDigital
                ? ['required', 'array', 'min:1', "max:{$imageMax}"]
                : ['nullable', 'array', "max:{$imageMax}"],
            'images.*.file' => ['nullable', 'file', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:6144'],
            'images.*.alt' => ['nullable', 'string', 'max:255'],
            'images.*.url' => ['nullable', 'string', 'max:2048'],
            'digital_file' => $isDigital
                ? ['required_if:delivery_mode,reader,download', 'nullable', 'file', "max:{$fileMaxKilobytes}", 'mimes:pdf,zip,epub']
                : ['nullable', 'file', "max:{$fileMaxKilobytes}", 'mimes:pdf,zip,epub'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
