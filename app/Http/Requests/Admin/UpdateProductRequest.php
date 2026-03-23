<?php

namespace App\Http\Requests\Admin;

use App\Models\Business;
use Illuminate\Foundation\Http\FormRequest;

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
            'name'        => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'price'       => ['sometimes', 'required', 'numeric', 'min:0', 'max:999999.99'],
            'stock'       => ['sometimes', 'required', 'integer', 'min:0'],
            'is_active'   => ['boolean'],
            'images'      => ['nullable', 'array', 'max:10'],
            'images.*'    => ['string', 'max:2048'],
            'metadata'    => ['nullable', 'array'],
        ];
    }
}
