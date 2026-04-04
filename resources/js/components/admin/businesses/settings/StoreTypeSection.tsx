import { Lock, Package, Zap } from 'lucide-react';
import { FormSection } from '@/components/admin/form-section';
import { Label } from '@/components/ui/label';
import { BUSINESS_CATEGORIES } from '@/data/businessCategories';
import type { Business, BusinessCategory } from '@/types';

type Props = {
    business: Business;
    businessCategory: BusinessCategory | '';
    errors: Partial<Record<'business_category', string>>;
    onCategoryChange: (value: BusinessCategory | '') => void;
};

export function StoreTypeSection({ business, businessCategory, errors, onCategoryChange }: Props) {
    return (
        <FormSection
            title="Store Type"
            description="Choose what kind of store you run and your industry category."
        >
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label>Business type</Label>
                    <div className="flex h-full items-center gap-3 rounded-lg border border-site-border bg-zinc-50 p-4">
                        {business.business_type === 'digital' ? (
                            <Zap className="h-5 w-5 text-brand" />
                        ) : (
                            <Package className="h-5 w-5 text-brand" />
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-semibold capitalize text-site-fg">
                                {business.business_type}
                            </p>
                            <p className="text-[11px] leading-tight text-site-muted">
                                {business.business_type === 'digital'
                                    ? 'Files and downloads. 5% per-sale commission.'
                                    : 'Goods with stock management. Subscription billing.'}
                            </p>
                        </div>
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                            <Lock className="h-3 w-3" />
                            Locked
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Category</Label>
                    {errors.business_category && (
                        <p className="text-xs text-red-600">{errors.business_category}</p>
                    )}
                    <select
                        value={businessCategory}
                        onChange={(e) => onCategoryChange(e.target.value as BusinessCategory | '')}
                        className="h-full min-h-[58px] w-full rounded-lg border border-site-border bg-white px-3 py-2 text-sm text-site-fg focus:outline-none focus:ring-2 focus:ring-brand/30"
                    >
                        <option value="">Select a category…</option>
                        {BUSINESS_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </FormSection>
    );
}
