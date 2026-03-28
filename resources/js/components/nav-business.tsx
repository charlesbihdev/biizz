import { Link } from '@inertiajs/react';
import {
    BotMessageSquare,
    ChartNoAxesColumn,
    FileText,
    FolderOpen,
    Globe,
    LayoutDashboard,
    Package,
    Palette,
    Settings,
    ShoppingBag,
} from 'lucide-react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { show } from '@/routes/businesses';
import { index as categoriesIndex } from '@/routes/businesses/categories';
import { index as ordersIndex } from '@/routes/businesses/orders';
import { index as pagesIndex } from '@/routes/businesses/pages';
import { index as productsIndex } from '@/routes/businesses/products';
import { edit as settingsEdit } from '@/routes/businesses/settings';
import { edit as themeEdit } from '@/routes/businesses/theme';
import type { Business } from '@/types';

function SoonBadge() {
    return (
        <span className="ml-auto rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-amber-700">
            soon
        </span>
    );
}

type NavEntry = {
    title: string;
    href: string | null;
    icon: React.ElementType;
    soon?: boolean;
    exact?: boolean;
};

function NavGroup({
    label,
    items,
    isActive,
}: {
    label: string;
    items: NavEntry[];
    isActive: (item: NavEntry) => boolean;
}) {
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {item.soon ? (
                            <SidebarMenuButton
                                tooltip={{ children: `${item.title} — coming soon` }}
                                className="cursor-default opacity-50 pointer-events-none"
                            >
                                <item.icon />
                                <span>{item.title}</span>
                                <SoonBadge />
                            </SidebarMenuButton>
                        ) : (
                            <SidebarMenuButton
                                asChild
                                isActive={isActive(item)}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href!} prefetch>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

export function NavBusiness({ business }: { business: Business }) {
    const { isCurrentOrParentUrl, isCurrentUrl } = useCurrentUrl();
    const b = { business: business.slug };

    const sellItems: NavEntry[] = [
        { title: 'Overview',   href: show(b).url,            icon: LayoutDashboard, exact: true },
        { title: 'Orders',     href: ordersIndex(b).url,     icon: ShoppingBag },
        { title: 'Products',   href: productsIndex(b).url,   icon: Package },
        { title: 'Categories', href: categoriesIndex(b).url, icon: FolderOpen },
    ];

    const storefrontItems: NavEntry[] = [
        { title: 'Theme',  href: themeEdit(b).url,  icon: Palette },
        { title: 'Pages',  href: pagesIndex(b).url, icon: FileText },
        { title: 'Domain', href: null,               icon: Globe,   soon: true },
    ];

    const engageItems: NavEntry[] = [
        { title: 'WhatsApp AI', href: null, icon: BotMessageSquare,  soon: true },
        { title: 'Analytics',   href: null, icon: ChartNoAxesColumn, soon: true },
    ];

    const settingsItems: NavEntry[] = [
        { title: 'Settings', href: settingsEdit(b).url, icon: Settings },
    ];

    const isActive = (item: NavEntry): boolean => {
        if (!item.href) {
            return false;
        }

        return item.exact ? isCurrentUrl(item.href) : isCurrentOrParentUrl(item.href);
    };

    return (
        <>
            <NavGroup label="Sell"       items={sellItems}       isActive={isActive} />
            <NavGroup label="Storefront" items={storefrontItems} isActive={isActive} />
            <NavGroup label="Engage"     items={engageItems}     isActive={isActive} />
            <NavGroup label="Settings"   items={settingsItems}   isActive={isActive} />
        </>
    );
}
