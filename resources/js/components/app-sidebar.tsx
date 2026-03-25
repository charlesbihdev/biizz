import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import BusinessSwitcher from '@/components/business-switcher';
import { NavBusiness } from '@/components/nav-business';
import { NavMain } from '@/components/nav-main';
import { UserAvatarMenu } from '@/components/user-avatar-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { Business } from '@/types';

const dashboardNavItems = [
    { title: 'Overview', href: dashboard().url, icon: LayoutDashboard },
];

export function AppSidebar() {
    const { business } = usePage().props;

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* Header: logo left, user avatar right (hidden when collapsed) */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-2">
                            <SidebarMenuButton size="lg" asChild className="flex-1">
                                <Link href={dashboard().url} prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>

                            {/* Hidden in collapsed/icon mode */}
                            <div className="shrink-0 group-data-[collapsible=icon]:hidden">
                                <UserAvatarMenu />
                            </div>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Context-aware nav */}
            <SidebarContent>
                {business
                    ? <NavBusiness business={business as Business} />
                    : <NavMain items={dashboardNavItems} label="Workspace" />
                }
            </SidebarContent>

            {/* Footer: business switcher only */}
            <SidebarFooter>
                <BusinessSwitcher />
            </SidebarFooter>
        </Sidebar>
    );
}
