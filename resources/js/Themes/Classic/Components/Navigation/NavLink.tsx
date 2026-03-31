import { Link } from '@inertiajs/react';
import React from 'react';

interface Props {
    href: string;
    active: boolean;
    accent: string;
    primary: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
}

export default function NavLink({
    href,
    active,
    accent,
    primary,
    children,
    icon,
}: Props) {
    const inactiveColor = primary + 'b3'; // 70% opacity
    return (
        <Link
            href={href}
            className="flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-semibold transition"
            style={
                active
                    ? { color: accent, borderColor: accent }
                    : { color: inactiveColor, borderColor: 'transparent' }
            }
            onMouseEnter={(e) => {
                if (!active) {
                    e.currentTarget.style.color = primary;
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.currentTarget.style.color = inactiveColor;
                }
            }}
        >
            {icon}
            {children}
        </Link>
    );
}
