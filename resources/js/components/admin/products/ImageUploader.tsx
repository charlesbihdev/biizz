import { ImagePlus, Lock, Star, X } from 'lucide-react';
import { useRef } from 'react';
import { useTier } from '@/hooks/use-tier';
import { useUpgradeModal } from '@/stores/upgrade-modal-store';

export interface UploadedImage {
    url: string;
    alt?: string;
    file?: File;
}

interface Props {
    businessSlug: string;
    images: UploadedImage[];
    onChange: (images: UploadedImage[]) => void;
}

// Defensive ceiling. Any tier hitting this number has a misconfigured
// `max_product_images` in config/biizz.php.
const HARD_CEILING = 50;

export function ImageUploader({ images, onChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { limit, nextTier, tierLimit, tierMeta } = useTier();
    const showUpgrade = useUpgradeModal((s) => s.show);

    const tierMax = limit('max_product_images') ?? HARD_CEILING;
    const atCap = images.length >= tierMax;

    // Resolve the next tier's image cap so the upsell line is always config-
    // accurate ("Upgrade to Pro for up to 8" reflects whatever's in
    // config/biizz.php).
    const upgradeTier = nextTier();
    const upgradeMax = upgradeTier ? tierLimit(upgradeTier, 'max_product_images') : null;
    const upgradeLabel = upgradeTier ? tierMeta(upgradeTier)?.label : null;
    const canShowUpsell = upgradeTier !== null && upgradeMax !== null && upgradeMax > tierMax;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || atCap) {
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        onChange([...images, { url: previewUrl, alt: '', file }]);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const remove = (idx: number) => {
        const img = images[idx];
        if (img.file) {
            URL.revokeObjectURL(img.url);
        }
        onChange(images.filter((_, i) => i !== idx));
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
                {images.map((img, idx) => (
                    <div key={img.url} className="group relative h-20 w-20 shrink-0">
                        <img
                            src={img.url}
                            alt={img.alt || `Image ${idx + 1}`}
                            className="h-full w-full rounded-lg border border-site-border object-cover"
                        />
                        {idx === 0 && (
                            <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-black/70 px-1 py-0.5 text-[9px] font-semibold text-white">
                                <Star className="h-2.5 w-2.5" /> Main
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => remove(idx)}
                            className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow group-hover:flex"
                            aria-label="Remove image"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}

                {/* Active "Add" tile when there's still room. */}
                {!atCap && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-site-border text-site-muted transition hover:border-brand hover:text-brand"
                    >
                        <ImagePlus className="h-5 w-5" />
                        <span className="text-[10px] font-medium">Add photo</span>
                    </button>
                )}

                {/* Visible-but-grayed upgrade slot when an upgrade tier exists
                    and would raise the cap. ANALYTICS_TIERS.md section 1.2. */}
                {atCap && canShowUpsell && (
                    <button
                        type="button"
                        onClick={() => showUpgrade({ feature: 'products.multiple_images' })}
                        title={`Upgrade to ${upgradeLabel} for more product photos`}
                        className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-brand/40 bg-brand/5 text-brand transition hover:border-brand hover:bg-brand/10"
                    >
                        <Lock className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">
                            {upgradeLabel}
                        </span>
                    </button>
                )}
            </div>

            {atCap ? (
                canShowUpsell ? (
                    <p className="text-xs text-site-muted">
                        Your plan includes {tierMax} {tierMax === 1 ? 'photo' : 'photos'} per product.{' '}
                        <button
                            type="button"
                            onClick={() => showUpgrade({ feature: 'products.multiple_images' })}
                            className="font-semibold text-brand hover:underline"
                        >
                            Upgrade to {upgradeLabel} for up to {upgradeMax}.
                        </button>
                    </p>
                ) : (
                    <p className="text-xs text-site-muted">
                        Maximum {tierMax} images reached.
                    </p>
                )
            ) : null}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
}
