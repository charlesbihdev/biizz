<?php

namespace App\Http\Controllers\Admin;

use App\Data\ThemeSettingsData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateThemeSettingsRequest;
use App\Models\Business;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ThemeSettingsController extends Controller
{
    /**
     * Return the current theme settings for the admin to edit.
     * The frontend reads the schema from the TypeScript SCHEMA_MAP — not from here.
     * For course-funnel, compact products are passed so the product picker has options.
     */
    public function edit(Business $business): Response
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $compactProducts = [];

        if ($business->theme_id === 'course-funnel') {
            $compactProducts = $business->products()
                ->active()
                ->with('images')
                ->get(['id', 'name'])
                ->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'image' => $p->images->first()?->url,
                ])
                ->values()
                ->all();
        }

        return Inertia::render('Admin/Theme/Settings', [
            'business' => $business,
            'compact_products' => $compactProducts,
        ]);
    }

    /**
     * Validate and persist new theme settings to the jsonb column.
     * ThemeSettingsData ensures no garbage ever reaches the database.
     */
    public function update(UpdateThemeSettingsRequest $request, Business $business): RedirectResponse
    {
        $data = ThemeSettingsData::from($request->validated());

        $business->update([
            'theme_settings' => $data->toArray(),
        ]);

        return back()->with('success', 'Theme settings saved.');
    }

    /**
     * Switch the active theme for a business.
     */
    public function switchTheme(Business $business, string $themeId): RedirectResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $business->update(['theme_id' => $themeId]);

        return back()->with('success', "Theme switched to {$themeId}.");
    }
}
