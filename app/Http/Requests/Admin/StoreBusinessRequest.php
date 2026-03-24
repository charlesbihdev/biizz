<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBusinessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name'              => ['required', 'string', 'max:255'],
            'slug'              => ['nullable', 'string', 'max:100', 'alpha_dash', 'unique:businesses,slug'],
            'business_type'     => ['required', 'string', 'in:physical,digital'],
            'business_category' => ['required', 'string', 'max:60'],
            'tagline'           => ['nullable', 'string', 'max:150'],
            'description'       => ['nullable', 'string', 'max:500'],
        ];
    }
}
