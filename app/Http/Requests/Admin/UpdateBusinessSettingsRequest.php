<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBusinessSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'logo_url' => ['nullable', 'string', 'max:2048'],
            'favicon_url' => ['nullable', 'string', 'max:2048'],
            'tagline' => ['nullable', 'string', 'max:150'],
            'business_category' => ['nullable', 'string', 'max:60'],
            'description' => ['nullable', 'string', 'max:500'],
            'contact_email' => ['nullable', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:300'],
            'website' => ['nullable', 'url', 'max:200'],
            'social_links.instagram' => ['nullable', 'url', 'max:200'],
            'social_links.whatsapp' => ['nullable', 'string', 'max:30'],
            'social_links.facebook' => ['nullable', 'url', 'max:200'],
            'social_links.tiktok' => ['nullable', 'url', 'max:200'],
            'social_links.twitter' => ['nullable', 'url', 'max:200'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:300'],
            'seo_image' => ['nullable', 'string', 'max:2048'],
            'show_branding' => ['boolean'],
        ];
    }
}
