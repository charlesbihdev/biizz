<?php

namespace App\Http\Requests\Admin;

use App\Models\Business;
use App\Services\Subscription\DigitalStorageService;
use App\Services\Subscription\FeatureAccess;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Business $business */
        $business = $this->route('business');

        return $business->isOwnedBy($this->user());
    }

    /**
     * Normalise the slug to lowercase before validation so a manually
     * edited slug like "My-Product" passes the lowercase-only regex rule.
     */
    protected function prepareForValidation(): void
    {
        if ($this->filled('slug')) {
            $this->merge(['slug' => Str::lower((string) $this->input('slug'))]);
        }

        /** @var Business $business */
        $business = $this->route('business');
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
        $product = $this->route('product');
        $isDigital = $business->business_type === 'digital';
        $hasFile = $product ? $product->files()->exists() : false;
        $effectiveMode = $this->input('delivery_mode', $product?->delivery_mode);
        $needsFile = in_array($effectiveMode, ['reader', 'download'], true);
        $imageMax = FeatureAccess::limit($business, 'max_product_images') ?? 8;

        $fileMaxBytes = DigitalStorageService::perFileMaxBytes($business);
        $fileMaxKilobytes = $fileMaxBytes !== null
            ? (int) ceil($fileMaxBytes / 1024)
            : 5 * 1024 * 1024;

        return [
            'category_id' => $isDigital
                ? ['nullable', 'integer', 'exists:categories,id']
                : ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'digital_category' => $isDigital
                ? ['sometimes', 'required', 'string', Rule::in(['ebooks', 'courses', 'templates', 'coaching', 'playbooks', 'webinars', 'community', 'services', 'others'])]
                : ['nullable', 'string'],
            'delivery_mode' => $isDigital
                ? ['sometimes', 'required', 'string', Rule::in(['reader', 'download', 'external_link'])]
                : ['nullable'],
            'external_url' => $isDigital
                ? ['required_if:delivery_mode,external_link', 'nullable', 'url', 'max:2048']
                : ['nullable'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9\-]+$/',
                Rule::unique('products')->where('business_id', $this->route('business')->id)->ignore($this->route('product')),
            ],
            'description' => ['nullable', 'string', 'max:50000'],
            'promo_video' => ['nullable', 'string', 'max:2048'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0', 'max:999999.99'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0', 'max:999999.99', 'gt:price'],
            'stock' => ['sometimes', 'required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'images' => $isDigital
                ? ['sometimes', 'required', 'array', 'min:1', "max:{$imageMax}"]
                : ['nullable', 'array', "max:{$imageMax}"],
            'images.*.file' => ['nullable', 'file', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:6144'],
            'images.*.alt' => ['nullable', 'string', 'max:255'],
            'images.*.url' => ['nullable', 'string', 'max:2048'],
            'digital_file' => ($isDigital && $needsFile && ! $hasFile)
                ? ['required', 'file', "max:{$fileMaxKilobytes}", 'mimes:pdf,zip,epub']
                : ['nullable', 'file', "max:{$fileMaxKilobytes}", 'mimes:pdf,zip,epub'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
