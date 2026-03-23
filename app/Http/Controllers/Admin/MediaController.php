<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    /**
     * Upload a media file for a business (e.g. theme hero image).
     * Returns the public URL of the stored file.
     */
    public function store(Request $request, Business $business): JsonResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        $request->validate(['file' => ['required', 'image', 'max:5120']]);

        $path = $request->file('file')->store("businesses/{$business->id}", 'public');

        return response()->json(['url' => Storage::disk('public')->url($path)]);
    }
}
