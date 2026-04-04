import { FormSection } from '@/components/admin/form-section';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field } from './Field';

type Props = {
    contactEmail: string;
    phone: string;
    address: string;
    errors: Partial<Record<'contact_email' | 'phone' | 'address', string>>;
    onContactEmailChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onAddressChange: (value: string) => void;
};

export function ContactSection({ contactEmail, phone, address, errors, onContactEmailChange, onPhoneChange, onAddressChange }: Props) {
    return (
        <FormSection
            title="Contact"
            description="Displayed on your storefront so customers can reach you."
        >
            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email" error={errors.contact_email}>
                    <Input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => onContactEmailChange(e.target.value)}
                        placeholder="hello@yourbrand.com"
                        className="border-site-border focus-visible:ring-brand/30"
                    />
                </Field>

                <Field label="Phone" error={errors.phone}>
                    <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => onPhoneChange(e.target.value)}
                        placeholder="+233 20 000 0000"
                        className="border-site-border focus-visible:ring-brand/30"
                    />
                </Field>
            </div>

            <Field label="Address" error={errors.address}>
                <Textarea
                    value={address}
                    onChange={(e) => onAddressChange(e.target.value)}
                    placeholder="123 Main Street, Accra, Ghana"
                    rows={2}
                    className="resize-none border-site-border focus-visible:ring-brand/30"
                />
            </Field>
        </FormSection>
    );
}
