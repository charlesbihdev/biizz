<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class MediaController extends Controller
{
    /**
     * Upload a media file for a business (e.g. theme hero image).
     * Returns the public URL of the stored file.
     */
    public function store(Request $request, Business $business): JsonResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        try {
            $request->validate(['file' => ['required', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:6144']]);

            $path = $request->file('file')->storePublicly("businesses/{$business->id}", 's3');

            return response()->json(['url' => Storage::disk('s3')->url($path)]);
        } catch (ValidationException $e) {
            Log::error('Media upload validation failed', [
                'errors' => $e->errors(),
                'business_id' => $business->id,
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Media upload exception', [
                'message' => $e->getMessage(),
                'business_id' => $business->id,
            ]);
            throw $e;
        }
    }

    /**
     * Upload a downloadable file for a digital product (PDF, ZIP, EPUB — up to 50 MB).
     */
    public function storeFile(Request $request, Business $business, Product $product): JsonResponse
    {
        abort_unless($business->isOwnedBy(auth()->user()), 403);

        try {
            $request->validate([
                'file' => ['required', 'file', 'max:51200', 'mimes:pdf,zip,epub'],
            ]);

            $uploaded = $request->file('file');

            $path = $uploaded->store("businesses/{$business->id}/files", 's3');

            $file = $product->files()->create([
                'url' => Storage::disk('s3')->url($path),
                'filename' => $uploaded->getClientOriginalName(),
                'file_size' => $uploaded->getSize(),
                'mime_type' => $uploaded->getMimeType(),
            ]);

            return response()->json([
                'id' => $file->id,
                'url' => $file->url,
                'filename' => $file->filename,
                'file_size' => $file->file_size,
            ]);
        } catch (ValidationException $e) {
            Log::error('Product file validation failed', [
                'errors' => $e->errors(),
                'business_id' => $business->id,
                'product_id' => $product->id,
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Product file upload exception', [
                'message' => $e->getMessage(),
                'business_id' => $business->id,
                'product_id' => $product->id,
            ]);
            throw $e;
        }
    }
}
