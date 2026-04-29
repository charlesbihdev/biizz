import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard } from 'lucide-react';
import AppLogo from '@/components/app-logo';
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
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard().url} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {business
                    ? <NavBusiness business={business as Business} />
                    : <NavMain items={dashboardNavItems} label="Workspace" />
                }
            </SidebarContent>

            <SidebarFooter>
                <UserAvatarMenu />
            </SidebarFooter>
        </Sidebar>
    );
}
