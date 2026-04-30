import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { useCustomerAuth } from '@/Themes/Shared/Hooks/useCustomerAuth';
import { useCustomerAddresses } from '@/Themes/Shared/Hooks/useCustomerAddresses';
import { ChevronLeft, MessageCircle, Phone } from 'lucide-react';
import OrderSummary from './OrderSummary';
import { useCartStore } from '@/stores/cartStore';
import type { Business, CustomerAddress } from '@/types/business';

interface Props { business: Business; primary: string; addresses?: CustomerAddress[] }

function buildWhatsAppUrl(business: Business, items: { name: string; price: number; quantity: number }[], total: number, name: string, phone: string, address: string, city: string, country: string): string {
    const lines = items.map(
        (item) => `- ${item.name} (x${item.quantity}) — GHS ${(item.price * item.quantity).toFixed(2)}`,
    );

    const message = [
        `Hi, I'd like to place an order from ${business.name}:`,
        '',
        ...lines,
        '',
        `Total: GHS ${total.toFixed(2)}`,
        '',
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Delivery Address: ${address}, ${city}, ${country}`
    ].join('\n');

    const raw = business.social_links?.whatsapp ?? business.phone ?? '';
    const number = raw.replace(/\D/g, '');

    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export default function WhatsAppCheckout({ business, primary, addresses }: Props) {
    const { items, total, itemCount, removeFromCart, updateQuantity } = useCartStore();
    const { customer } = useCustomerAuth();
    const addrHook = useCustomerAddresses(addresses);

    const [name, setName]   = useState(customer?.name ?? '');
    const [phone, setPhone] = useState(customer?.phone ?? '');
    
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [region, setRegion] = useState('');
    const [country, setCountry] = useState('Ghana');

    useEffect(() => {
        if (addrHook.selectedAddress) {
            setAddress(addrHook.selectedAddress.street_address);
            setCity(addrHook.selectedAddress.city);
            setRegion(addrHook.selectedAddress.region || '');
            setCountry(addrHook.selectedAddress.country);
        } else {
            setAddress('');
            setCity('');
            setRegion('');
            setCountry('Ghana');
        }
    }, [addrHook.selectedAddress]);

    const whatsappNumber = business.social_links?.whatsapp ?? business.phone;
    const hasContact = !!(whatsappNumber || business.contact_email);
    const isManual = addrHook.selectedAddressId === null;

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const url = buildWhatsAppUrl(business, items, total, name, phone, address, city, country);
        window.open(url, '_blank', 'noopener');
    };

    return (
        <main className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
            <nav className="mb-8 flex items-center gap-2 text-sm" style={{ color: primary + 'b3' }}>
                <Link href={`/s/${business.slug}`} className="flex items-center gap-1 transition hover:opacity-80" style={{ color: primary + 'b3' }}>
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back to store
                </Link>
            </nav>

            <h1 className="mb-8 text-2xl font-bold" style={{ color: primary }}>Checkout</h1>

            <div className="mb-8 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <MessageCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-sm text-emerald-800">
                    This store accepts orders via WhatsApp. Fill in your details and we'll prepare your order message.
                </p>
            </div>

            <div className="grid gap-10 lg:grid-cols-5">
                {whatsappNumber ? (
                    <form onSubmit={handleSend} className="space-y-6 lg:col-span-3">
                        <div className="space-y-5">
                            <h2 className="text-lg font-semibold" style={{ color: primary }}>Your Details</h2>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium" style={{ color: primary + 'cc' }}>Full Name</label>
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400" placeholder="John Doe" />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium" style={{ color: primary + 'cc' }}>Phone Number</label>
                                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400" placeholder="+233 XX XXX XXXX" />
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
                                        <input type="text" required value={address} onChange={e => setAddress(e.target.value)}
                                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 bg-white" placeholder="123 Example Street" />
                                    </div>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium" style={{ color: primary + 'cc' }}>City</label>
                                            <input type="text" required value={city} onChange={e => setCity(e.target.value)}
                                                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 bg-white" placeholder="Accra" />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium" style={{ color: primary + 'cc' }}>Region / State</label>
                                            <input type="text" required value={region} onChange={e => setRegion(e.target.value)}
                                                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 bg-white" placeholder="Greater Accra" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium" style={{ color: primary + 'cc' }}>Country</label>
                                        <input type="text" required value={country} onChange={e => setCountry(e.target.value)}
                                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 bg-white" placeholder="Ghana" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
                            style={{ backgroundColor: '#25D366' }}
                        >
                            <MessageCircle className="h-4 w-4" />
                            Send Order via WhatsApp — GHS {total.toFixed(2)}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4 lg:col-span-3">
                        <h2 className="text-lg font-semibold" style={{ color: primary }}>Contact the Store</h2>
                        <p className="text-sm text-zinc-500">
                            Reach out directly to place your order.
                        </p>
                        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
                            {business.contact_email && (
                                <a
                                    href={`mailto:${business.contact_email}`}
                                    className="flex items-center gap-3 text-sm transition hover:opacity-80"
                                    style={{ color: primary }}
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs">@</span>
                                    {business.contact_email}
                                </a>
                            )}
                            {business.phone && (
                                <a
                                    href={`tel:${business.phone}`}
                                    className="flex items-center gap-3 text-sm transition hover:opacity-80"
                                    style={{ color: primary }}
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100">
                                        <Phone className="h-3.5 w-3.5" />
                                    </span>
                                    {business.phone}
                                </a>
                            )}
                            {!hasContact && (
                                <p className="text-sm text-zinc-400">No contact information available.</p>
                            )}
                        </div>
                    </div>
                )}

                <OrderSummary
                    primary={primary}
                    items={items}
                    total={total}
                    itemCount={itemCount}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                />
            </div>
        </main>
    );
}
