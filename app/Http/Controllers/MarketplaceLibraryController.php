<?php

namespace App\Http\Controllers;

use App\Models\Buyer;
use App\Models\MarketplacePurchase;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MarketplaceLibraryController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var Buyer $buyer */
        $buyer = $request->user('buyer');

        $purchases = MarketplacePurchase::where('buyer_id', $buyer->id)
            ->whereIn('status', ['paid', 'free'])
            ->with(['product' => fn ($q) => $q->withoutGlobalScopes()->with('images', 'files', 'business:id,name,slug')])
            ->latest()
            ->paginate(12);

        $stats = [
            'purchase_count' => MarketplacePurchase::where('buyer_id', $buyer->id)
                ->whereIn('status', ['paid', 'free'])
                ->count(),
            'total_spent' => (string) MarketplacePurchase::where('buyer_id', $buyer->id)
                ->where('status', 'paid')
                ->sum('amount_paid'),
        ];

        return Inertia::render('Marketplace/Dashboard/Library', [
            'purchases' => $purchases,
            'stats' => $stats,
        ]);
    }

    public function read(Request $request, MarketplacePurchase $purchase): Response|RedirectResponse
    {
        /** @var Buyer $buyer */
        $buyer = $request->user('buyer');

        abort_unless($purchase->buyer_id === $buyer->id, 403);
        abort_unless(in_array($purchase->status, ['paid', 'free']), 403);

        $purchase->load(['product' => fn ($q) => $q->withoutGlobalScopes()->with('files')]);
        $file = $purchase->product?->files->first();

        abort_unless($file && $file->path, 404);

        // 30-minute presigned URL — react-pdf loads the PDF directly from MinIO
        $fileUrl = Storage::disk('s3_private')->temporaryUrl(
            $file->path,
            now()->addMinutes(30),
        );

        return Inertia::render('Marketplace/Reader', [
            'purchase' => $purchase->only(['id', 'status']),
            'productName' => $purchase->product->name,
            'fileUrl' => $fileUrl,
        ]);
    }

    public function show(Request $request, MarketplacePurchase $purchase): RedirectResponse
    {
        /** @var Buyer $buyer */
        $buyer = $request->user('buyer');

        abort_unless($purchase->buyer_id === $buyer->id, 403);
        abort_unless(in_array($purchase->status, ['paid', 'free']), 403);

        $purchase->load(['product' => fn ($q) => $q->withoutGlobalScopes()->with('files')]);
        $file = $purchase->product?->files->first();

        abort_unless($file, 404);

        abort_unless($file->path, 404);

        $downloadUrl = Storage::disk('s3_private')->temporaryUrl(
            $file->path,
            now()->addMinutes(10),
            ['ResponseContentDisposition' => 'attachment; filename="'.rawurlencode($file->filename).'"'],
        );

        return redirect($downloadUrl);
    }
}
