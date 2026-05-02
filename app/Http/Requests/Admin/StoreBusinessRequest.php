<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreBusinessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Lowercase the submitted slug so /dashboard/b/{slug} URLs and
     * unique-index lookups stay case-consistent. `alpha_dash` accepts
     * mixed case but mixed-case slugs cause confusing 404s downstream.
     */
    protected function prepareForValidation(): void
    {
        if ($this->filled('slug')) {
            $this->merge(['slug' => Str::lower((string) $this->input('slug'))]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:100', 'alpha_dash', 'unique:businesses,slug'],
            'business_type' => ['required', 'string', 'in:physical,digital'],
            'business_category' => ['required', 'string', 'max:60'],
            'tagline' => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }
}
