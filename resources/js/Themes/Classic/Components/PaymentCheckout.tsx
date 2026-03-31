import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useCustomerAuth } from '@/Themes/Shared/Hooks/useCustomerAuth';
import { ChevronLeft } from 'lucide-react';
import OrderSummary from './OrderSummary';
import { useCartStore } from '@/stores/cartStore';
import { useCheckout } from '@/Themes/Shared/Hooks/useCheckout';
import { useJunipayCheckout } from '@/Themes/Shared/Hooks/useJunipayCheckout';
import { useCustomerAddresses } from '@/Themes/Shared/Hooks/useCustomerAddresses';
import type { Business, CustomerAddress } from '@/types/business';

interface Props {
    business: Business;
    primary:  string;
    accent:   string;
    addresses?: CustomerAddress[];
}

interface CustomerFormProps {
    primary:      string;
    accent:       string;
    total:        number;
    isSubmitting: boolean;
    errors:       Record<string, string>;
    
    name:         string;
    email:        string;
    phone:        string;
    onNameChange:  (v: string) => void;
    onEmailChange: (v: string) => void;
    onPhoneChange: (v: string) => void;
    
    address:      string;
    city:         string;
    region:       string;
    country:      string;
    onAddressChange: (v: string) => void;
    onCityChange:    (v: string) => void;
    onRegionChange:  (v: string) => void;
    onCountryChange: (v: string) => void;
    
    saveAddress:  boolean;
    onSaveAddressChange: (v: boolean) => void;
    
    addrHook: ReturnType<typeof useCustomerAddresses>;
    
    onSubmit:     (e: React.FormEvent) => void;
    buttonLabel:  string;
}

function CustomerForm({
    primary, accent, total,
    isSubmitting, errors,
    name, email, phone,
    onNameChange, onEmailChange, onPhoneChange,
    address, city, region, country,
    onAddressChange, onCityChange, onRegionChange, onCountryChange,
    saveAddress, onSaveAddressChange,
    addrHook,
    onSubmit, buttonLabel,
}: CustomerFormProps) {
    const isManual = addrHook.selectedAddressId === null;

    return (
        <form onSubmit={onSubmit} className="space-y-6 lg:col-span-3">
            <div className="space-y-5">
                <h2 className="text-lg font-semibold" style={{ color: primary }}>Contact Details</h2>

                {(errors._form || errors._script) && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errors._form ?? errors._script}
                    </div>
                )}

                <div>
                    <label className="mb-1.5 block text-sm font-medium" style={{ color: primary + 'cc' }}>Full Name</label>
                    <input type="text" required value={name} onChange={e => onNameChange(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400" placeholder="John Doe" />
                    {errors.customer_name && <p className="mt-1 text-xs text-red-500">{errors.customer_name}</p>}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium" style={{ color: primary + 'cc' }}>Email</label>
                        <input type="email" required value={email} onChange={e => onEmailChange(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400" placeholder="john@example.com" />
                        {errors.customer_email && <p className="mt-1 text-xs text-red-500">{errors.customer_email}</p>}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium" style={{ color: primary + 'cc' }}>Phone Number</label>
                        <input type="tel" required value={phone} onChange={e => onPhoneChange(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400" placeholder="+233 XX XXX XXXX" />
                        {errors.customer_phone && <p className="mt-1 text-xs text-red-500">{errors.customer_phone}</p>}
                    </div>
                </div>
            </div>

            <hr className="border-zinc-100" />

            <div className="space-y-5">
                <h2 className="text-lg font-semibold" style={{ color: primary }}>Delivery Address</h2>

                {addrHook.hasAddresses && (
                    <div className="flex flex-col gap-2">
                        {addrHook.addresses.map(addr => (
                            <label key={addr.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${addrHook.selectedAddressId === addr.id ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200'}`}>
                                <input type="radio" className="mt-1" name="address_id" 
                                    checked={addrHook.selectedAddressId === addr.id}
                                    onChange={() => addrHook.setSelectedAddressId(addr.id)} 
                                />
                                <div>
                                    <p className="text-sm font-medium text-zinc-900">{addr.street_address}</p>
                                    <p className="text-xs text-zinc-500">{addr.city}{addr.region ? `, ${addr.region}` : ''}, {addr.country}</p>
                                </div>
                            </label>
                        ))}
                        <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${isManual ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200'}`}>
                            <input type="radio" name="address_id"
                                checked={isManual}
                                onChange={() => addrHook.setSelectedAddressId(null)} 
                            />
                            <p className="text-sm font-medium text-zinc-900">Enter a new address</p>
                        </label>
                    </div>
                )}

                {isManual && (
                    <div className="space-y-5 rounded-xl border border-zinc-100 bg-zinc-50/50 p-5">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium" style={{ color: primary + 'cc' }}>Street Address</label>
                            <input type="text" required value={address} onChange={e => onAddressChange(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 bg-white" placeholder="123 Example Street" />
                            {errors.delivery_address && <p className="mt-1 text-xs text-red-500">{errors.delivery_address}</p>}
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium" style={{ color: primary + 'cc' }}>City</label>
                                <input type="text" required value={city} onChange={e => onCityChange(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 bg-white" placeholder="Accra" />
                                {errors.delivery_city && <p className="mt-1 text-xs text-red-500">{errors.delivery_city}</p>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium" style={{ color: primary + 'cc' }}>Region / State</label>
                                <input type="text" required value={region} onChange={e => onRegionChange(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 bg-white" placeholder="Greater Accra" />
                                {errors.delivery_region && <p className="mt-1 text-xs text-red-500">{errors.delivery_region}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium" style={{ color: primary + 'cc' }}>Country</label>
                            <input type="text" required value={country} onChange={e => onCountryChange(e.target.value)}
                                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 bg-white" placeholder="Ghana" />
                            {errors.delivery_country && <p className="mt-1 text-xs text-red-500">{errors.delivery_country}</p>}
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer mt-2 w-max">
                            <input type="checkbox" checked={saveAddress} onChange={e => onSaveAddressChange(e.target.checked)} className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer w-4 h-4" />
                            <span className="text-sm font-medium text-zinc-700">Save this address for future orders</span>
                        </label>
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-8 w-full rounded-xl py-3.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: accent }}
            >
                {isSubmitting ? 'Processing...' : `${buttonLabel} — GHS ${total.toFixed(2)}`}
            </button>
        </form>
    );
}

function CheckoutFormWrapper({ business, primary, accent, addresses, mode }: Props & { mode: 'paystack' | 'junipay' }) {
    const { items, total, itemCount, removeFromCart, updateQuantity } = useCartStore();
    const paystackHook = useCheckout(business.slug);
    const junipayHook = useJunipayCheckout(business.slug);
    
    const { submitOrder, isSubmitting, errors } = mode === 'paystack' ? paystackHook : junipayHook;
    const { flash } = usePage<{ flash?: { error?: string } }>().props;
    const { customer } = useCustomerAuth();
    const addrHook = useCustomerAddresses(addresses);

    const [name, setName]   = useState(customer?.name  ?? '');
    const [email, setEmail] = useState(customer?.email ?? '');
    const [phone, setPhone] = useState(customer?.phone ?? '');

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [region, setRegion] = useState('');
    const [country, setCountry] = useState('Ghana');
    const [saveAddress, setSaveAddress] = useState(false);

    useEffect(() => {
        if (addrHook.selectedAddress) {
            setAddress(addrHook.selectedAddress.street_address);
            setCity(addrHook.selectedAddress.city);
            setRegion(addrHook.selectedAddress.region || '');
            setCountry(addrHook.selectedAddress.country);
            setSaveAddress(false);
        } else {
            setAddress('');
            setCity('');
            setRegion('');
            setCountry('Ghana');
        }
    }, [addrHook.selectedAddress]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitOrder({ 
            customer_name: name, customer_email: email, customer_phone: phone,
            delivery_address: address, delivery_city: city, delivery_region: region, delivery_country: country,
            save_address: saveAddress 
        });
    };

    return (
        <div className="grid gap-10 lg:grid-cols-5">
            {flash?.error && mode === 'paystack' && (
                <div className="lg:col-span-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {flash.error}
                </div>
            )}
            <CustomerForm
                primary={primary} accent={accent} total={total}
                isSubmitting={isSubmitting} errors={errors}
                name={name} email={email} phone={phone}
                onNameChange={setName} onEmailChange={setEmail} onPhoneChange={setPhone}
                address={address} city={city} region={region} country={country}
                onAddressChange={setAddress} onCityChange={setCity} onRegionChange={setRegion} onCountryChange={setCountry}
                saveAddress={saveAddress} onSaveAddressChange={setSaveAddress}
                addrHook={addrHook}
                onSubmit={handleSubmit}
                buttonLabel={mode === 'paystack' ? "Proceed to Payment" : "Pay Now"}
            />
            <OrderSummary
                primary={primary} items={items} total={total}
                itemCount={itemCount} updateQuantity={updateQuantity} removeFromCart={removeFromCart}
            />
        </div>
    );
}

export default function PaymentCheckout({ business, primary, accent, addresses }: Props) {
    const { flash } = usePage<{ flash?: { error?: string } }>().props;

    return (
        <main className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
            <nav className="mb-8 flex items-center gap-2 text-sm" style={{ color: primary + 'b3' }}>
                <Link
                    href={`/s/${business.slug}`}
                    className="flex items-center gap-1 transition hover:opacity-80"
                    style={{ color: primary + 'b3' }}
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back to store
                </Link>
            </nav>

            <h1 className="mb-8 text-2xl font-bold" style={{ color: primary }}>Checkout</h1>

            {flash?.error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {flash.error}
                </div>
            )}

            <CheckoutFormWrapper 
                business={business} primary={primary} accent={accent} addresses={addresses} 
                mode={business.default_payment_provider === 'junipay' ? 'junipay' : 'paystack'} 
            />
        </main>
    );
}
