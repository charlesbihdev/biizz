import { router, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, Plus, Store } from 'lucide-react';
import { useState } from 'react';
import { CreateBusinessModal } from '@/components/admin/businesses/CreateBusinessModal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { show } from '@/routes/businesses';

type BusinessEntry = { id: number; name: string; slug: string };

export default function BusinessSwitcher() {
    const { businesses, business } = usePage().props;
    const { isMobile } = useSidebar();
    const [createOpen, setCreateOpen] = useState(false);

    const activeBusiness = business ?? null;
    const initial = activeBusiness?.name?.[0]?.toUpperCase() ?? '?';

    const handleSwitch = (slug: string) => {
        router.visit(show({ business: slug }).url);
    };

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
                                    {activeBusiness ? initial : <Store className="h-4 w-4" aria-hidden />}
                                </div>

                                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                                    <span className="truncate text-sm font-semibold text-site-fg">
                                        {activeBusiness?.name ?? 'Select a business'}
                                    </span>
                                    {activeBusiness && (
                                        <span className="truncate text-xs text-site-muted">
                                            biizz.app/s/{activeBusiness.slug}
                                        </span>
                                    )}
                                </div>
                                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-site-muted" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border border-site-border bg-white shadow-md"
                            side={isMobile ? 'bottom' : 'right'}
                            align="end"
                            sideOffset={4}
                        >
                            {(businesses as BusinessEntry[]).map((b) => (
                                <DropdownMenuItem
                                    key={b.id}
                                    onClick={() => handleSwitch(b.slug)}
                                    className="gap-2 py-2"
                                >
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-dim text-xs font-bold text-brand">
                                        {b.name[0].toUpperCase()}
                                    </div>
                                    <span className="flex-1 truncate text-sm text-site-fg">{b.name}</span>
                                    {activeBusiness?.slug === b.slug && (
                                        <Check className="h-4 w-4 text-brand" />
                                    )}
                                </DropdownMenuItem>
                            ))}

                            {(businesses as BusinessEntry[]).length > 0 && (
                                <DropdownMenuSeparator className="bg-site-border" />
                            )}

                            <DropdownMenuItem
                                onClick={() => setCreateOpen(true)}
                                className="gap-2 py-2 text-site-muted"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="text-sm">New business</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>

            <CreateBusinessModal open={createOpen} onOpenChange={setCreateOpen} />
        </>
    );
}
