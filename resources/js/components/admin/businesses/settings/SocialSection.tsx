import { Facebook, Globe, Instagram, MessageCircle, Twitter } from 'lucide-react';
import { FormSection } from '@/components/admin/form-section';
import { Input } from '@/components/ui/input';
import type { SocialLinks } from '@/types';
import { Field } from './Field';

type Props = {
    socialLinks: SocialLinks;
    onSocialChange: (key: keyof SocialLinks, value: string) => void;
};

const SOCIAL_FIELDS = [
    { key: 'instagram', label: 'Instagram', icon: Instagram,     placeholder: 'https://instagram.com/yourbrand' },
    { key: 'whatsapp',  label: 'WhatsApp',  icon: MessageCircle, placeholder: '+233 20 000 0000' },
    { key: 'facebook',  label: 'Facebook',  icon: Facebook,      placeholder: 'https://facebook.com/yourbrand' },
    { key: 'tiktok',    label: 'TikTok',    icon: Globe,         placeholder: 'https://tiktok.com/@yourbrand' },
    { key: 'twitter',   label: 'X / Twitter', icon: Twitter,     placeholder: 'https://x.com/yourbrand' },
] as const;

export function SocialSection({ socialLinks, onSocialChange }: Props) {
    return (
        <FormSection
            title="Social & Links"
            description="Connect your social profiles to build trust with customers."
        >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
                    <Field key={key} label={label}>
                        <div className="flex items-center rounded-lg border border-site-border bg-white focus-within:ring-2 focus-within:ring-brand/30">
                            <Icon className="ml-3 h-4 w-4 shrink-0 text-site-muted" />
                            <Input
                                value={socialLinks[key] ?? ''}
                                onChange={(e) => onSocialChange(key, e.target.value)}
                                placeholder={placeholder}
                                className="border-0 focus-visible:ring-0"
                            />
                        </div>
                    </Field>
                ))}
            </div>
        </FormSection>
    );
}
