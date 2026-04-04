import { Globe } from 'lucide-react';
import { FormSection } from '@/components/admin/form-section';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field } from './Field';

type Props = {
    name: string;
    website: string;
    description: string;
    errors: Partial<Record<'name' | 'website' | 'description', string>>;
    onNameChange: (value: string) => void;
    onWebsiteChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
};

export function ProfileSection({ name, website, description, errors, onNameChange, onWebsiteChange, onDescriptionChange }: Props) {
    return (
        <FormSection
            title="Profile"
            description="How your business appears to customers on the storefront."
        >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Business name" error={errors.name}>
                    <Input
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="Zara's Boutique"
                        className="border-site-border focus-visible:ring-brand/30"
                    />
                </Field>

                <Field label="Website" error={errors.website}>
                    <div className="flex h-full items-center rounded-lg border border-site-border bg-white focus-within:ring-2 focus-within:ring-brand/30">
                        <Globe className="ml-3 h-4 w-4 shrink-0 text-site-muted" />
                        <Input
                            value={website}
                            onChange={(e) => onWebsiteChange(e.target.value)}
                            placeholder="https://yourbrand.com"
                            className="h-full border-0 focus-visible:ring-0"
                        />
                    </div>
                </Field>
            </div>

            <Field label="Description" error={errors.description}>
                <Textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Tell customers what makes your business special..."
                    rows={3}
                    className="resize-none border-site-border focus-visible:ring-brand/30"
                />
                <p className="text-right text-[11px] text-site-muted/60">
                    {description.length}/500
                </p>
            </Field>
        </FormSection>
    );
}
