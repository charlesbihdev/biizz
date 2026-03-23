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
        ];
    }
}
