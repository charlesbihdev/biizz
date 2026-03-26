<?php

namespace App\Http\Requests\Admin;

use App\Models\Business;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePageRequest extends FormRequest
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

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable', 'string', 'max:255', 'regex:/^[a-z0-9\-]+$/',
                Rule::unique('pages')->where('business_id', $business->id),
            ],
            'content' => ['nullable', 'string'],
            'type' => ['nullable', 'string', 'in:privacy_policy,faq,terms,about,shipping,acceptable_use'],
            'is_published' => ['required', 'boolean'],
            'images'       => ['nullable', 'array'],
            'images.*'     => ['image', 'max:6144'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}
