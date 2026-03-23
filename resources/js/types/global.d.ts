import type { Auth } from '@/types/auth';
import type { Business } from '@/types/business';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name:        string;
            auth:        Auth;
            sidebarOpen: boolean;
            // All authenticated pages: the user's owned businesses (for the sidebar switcher)
            businesses:  { id: number; name: string; slug: string }[];
            // Present only on routes that go through ResolveBusiness middleware
            business:    Business | null;
            [key: string]: unknown;
        };
    }
}
