import type { Auth } from '@/types/auth';
import type { Business } from '@/types/business';
import type { DigitalStorageShared, TierShared } from '@/types/tier';

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
            // Subscription tier snapshot for the active business, also only
            // present when ResolveBusiness ran. Null on auth/global pages.
            tier:        TierShared | null;
            // Live digital storage snapshot, mirrors the tier snapshot's
            // resolution rule.
            digitalStorage: DigitalStorageShared | null;
            flash: {
                success?: string | null;
                error?:   string | null;
                warning?: string | null;
            };
            [key: string]: unknown;
        };
    }
}
