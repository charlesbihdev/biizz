import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import type { Auth } from '@/types';

export default function SecurityLayer() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const email = auth?.buyer?.email ?? 'Protected Content';

    useEffect(() => {
        const preventDefault = (e: Event) => e.preventDefault();
        
        // Block right click
        document.addEventListener('contextmenu', preventDefault);
        
        // Block some key combos
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'u')) || 
                (e.metaKey && (e.key === 'p' || e.key === 's' || e.key === 'u'))
            ) {
                e.preventDefault();
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', preventDefault);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
            {/* Watermark Grid */}
            <div className="flex h-full w-full flex-wrap items-center justify-center opacity-[0.03]">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex w-1/4 -rotate-45 items-center justify-center py-20 text-sm font-bold tracking-widest whitespace-nowrap text-white lg:text-base"
                    >
                        {email} • BIIZZ SECURE CANVAS
                    </div>
                ))}
            </div>
            
            {/* Invisible selection blocker */}
            <div className="absolute inset-0 bg-transparent" style={{ WebkitUserSelect: 'none', userSelect: 'none' }} />
        </div>
    );
}
