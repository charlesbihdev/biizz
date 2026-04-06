<?php

namespace App\Http\Controllers;

use App\Models\MarketplacePurchase;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MarketplaceLibraryController extends Controller
{
    public function index(Request $request): Response
    {
        $purchases = MarketplacePurchase::where('user_id', $request->user()->id)
            ->whereIn('status', ['paid', 'free'])
            ->with(['product' => fn ($q) => $q->withoutGlobalScopes()->with('images', 'files', 'business:id,name,slug')])
            ->latest()
            ->paginate(12);

        return Inertia::render('Marketplace/Library', [
            'purchases' => $purchases,
        ]);
    }

    public function show(Request $request, MarketplacePurchase $purchase): StreamedResponse|RedirectResponse
    {
        abort_unless($purchase->user_id === $request->user()->id, 403);
        abort_unless(in_array($purchase->status, ['paid', 'free']), 403);

        $purchase->load(['product' => fn ($q) => $q->withoutGlobalScopes()->with('files')]);
        $file = $purchase->product?->files->first();

        abort_unless($file, 404);

        // Generate a short-lived signed URL for the file download
        $signedUrl = URL::temporarySignedRoute(
            'marketplace.library.show',
            now()->addMinutes(10),
            ['purchase' => $purchase->id]
        );

        return redirect($signedUrl);
    }
}
