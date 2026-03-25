<?php

namespace App\Http\Requests\Admin;

use App\Models\Business;
use Illuminate\Foundation\Http\FormRequest;

class UpdateThemeSettingsRequest extends FormRequest
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
            'primary_color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'accent_color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_scheme' => ['nullable', 'string', 'max:50'],
            'hero_image' => ['nullable', 'string', 'max:2048'],
            'show_featured' => ['boolean'],
            'show_testimonials' => ['boolean'],
            'show_hero' => ['boolean'],
            'layout_style' => ['nullable', 'string', 'in:grid,masonry,list'],
            'products_per_page' => ['nullable', 'string', 'in:12,24,36'],
        ];
    }
}
