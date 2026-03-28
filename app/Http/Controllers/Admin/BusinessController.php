<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BusinessRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBusinessRequest;
use App\Http\Requests\Admin\UpdateBusinessSettingsRequest;
use App\Models\Business;
use App\Services\PaymentService;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
    /**
     * List all businesses owned by the authenticated user.
     */
    public function index(): Response
    {
        $businesses = auth()->user()
            ->ownedBusinesses()
            ->withCount('products', 'orders')
            ->latest()
            ->get();

        return Inertia::render('Admin/Businesses/Index', [
            'businesses' => $businesses,
        ]);
    }

    /**
     * Show the form for creating a new business.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Businesses/Create');
    }

    /**
     * Store a new business and attach the owner to business_users.
     */
    public function store(StoreBusinessRequest $request): RedirectResponse
    {
        $business = Business::create([
            ...$request->validated(),
            'owner_id' => auth()->id(),
        ]);

        // Add owner to the pivot table so they show up in ->members() queries
        $business->members()->attach(auth()->id(), [
            'role' => BusinessRole::Owner->value,
            'created_at' => now(),
        ]);

        return to_route('businesses.show', $business)
            ->with('success', 'Business created successfully.');
    }

    /**
     * Show the admin dashboard (Overview) for a specific business.
     */
    public function show(Business $business): Response
    {
        $this->authorizeOwner($business);

        return Inertia::render('Admin/Businesses/Show', [
            'business' => $business->loadCount('products', 'orders'),
        ]);
    }

    /**
     * Toggle the business storefront on/off.
     */
    public function toggle(Business $business): RedirectResponse
    {
        $this->authorizeOwner($business);

        $business->update(['is_active' => ! $business->is_active]);

        $status = $business->is_active ? 'live' : 'offline';

        return to_route('businesses.show', $business)
            ->with('success', "Storefront is now {$status}.");
    }

    /**
     * Show the business settings form.
     */
    public function editSettings(Business $business): Response
    {
        $this->authorizeOwner($business);

        $paymentService = app(PaymentService::class);

        return Inertia::render('Admin/Businesses/Settings', [
            'business' => $business,
            'providers' => PaymentController::providersData($business, $paymentService),
        ]);
    }

    /**
     * Update business settings (name, contact info, social links, etc.).
     */
    public function updateSettings(Business $business, UpdateBusinessSettingsRequest $request): RedirectResponse
    {
        $this->authorizeOwner($business);

        $data = $request->safe()->except(['logo', 'favicon', 'seo_image']);

        foreach (['logo' => 'logo_url', 'favicon' => 'favicon_url', 'seo_image' => 'seo_image'] as $field => $column) {
            if ($request->hasFile($field)) {
                $path = $request->file($field)->storePublicly("businesses/{$business->id}", 's3');
                $data[$column] = Storage::disk('s3')->url($path);
            }
        }

        $business->update($data);

        return to_route('businesses.settings.edit', $business)
            ->with('success', 'Settings saved.');
    }

    /**
     * Permanently delete a business.
     * Will fail if orders exist due to restrictOnDelete constraint — by design.
     */
    public function destroy(Business $business): RedirectResponse
    {
        $this->authorizeOwner($business);

        try {
            $business->delete();
        } catch (QueryException) {
            return to_route('businesses.index')
                ->with('error', 'Cannot delete this business while it still has orders.');
        }

        return to_route('businesses.index')
            ->with('success', 'Business deleted.');
    }

    private function authorizeOwner(Business $business): void
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);
    }
}
