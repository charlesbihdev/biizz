<?php

namespace App\Http\Requests\Admin;

use App\Models\Business;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Business $business */
        $business = $this->route('business');

        return $business->isOwnedBy($this->user());
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        /** @var Business $business */
        $business = $this->route('business');
        $isDigital = $business->business_type === 'digital';

        return [
            'category_id' => $isDigital
                ? ['nullable', 'integer', 'exists:categories,id']
                : ['required', 'integer', 'exists:categories,id'],
            'digital_category' => $isDigital
                ? ['required', 'string', 'in:ebooks,courses,templates,coaching,playbooks,webinars,community,services,others']
                : ['nullable', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable', 'string', 'max:255', 'regex:/^[a-z0-9\-]+$/',
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
            'images' => ['nullable', 'array', 'max:8'],
            'images.*.file' => ['nullable', 'file', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:6144'],
            'images.*.alt' => ['nullable', 'string', 'max:255'],
            'images.*.url' => ['nullable', 'string', 'max:2048'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
