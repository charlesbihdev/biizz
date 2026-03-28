<?php

namespace App\Http\Requests\Admin;

use App\Models\Business;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePageRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes', 'nullable', 'string', 'max:255', 'regex:/^[a-z0-9\-]+$/',
                Rule::unique('pages')->where('business_id', $business->id)->ignore($this->route('page')),
            ],
            'content' => ['nullable', 'string'],
            'type' => ['nullable', 'string', 'in:privacy_policy,faq,terms,about,shipping,acceptable_use'],
            'is_published' => ['boolean'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:6144'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
