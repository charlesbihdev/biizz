<?php

namespace App\Http\Requests\Admin;

use App\Models\Business;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
        return [
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes', 'nullable', 'string', 'max:255', 'regex:/^[a-z0-9\-]+$/',
                Rule::unique('products')->where('business_id', $this->route('business')->id)->ignore($this->route('product')),
            ],
            'description' => ['nullable', 'string', 'max:5000'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0', 'max:999999.99'],
            'stock' => ['sometimes', 'required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'images' => ['nullable', 'array', 'max:8'],
            'images.*.url' => ['required', 'string', 'url', 'max:2048'],
            'images.*.alt' => ['nullable', 'string', 'max:255'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
