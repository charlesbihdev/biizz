export const DIGITAL_CATEGORIES = [
    'ebooks',
    'courses',
    'templates',
    'coaching',
    'playbooks',
    'webinars',
    'community',
    'services',
    'others',
] as const;

export type DigitalCategory = (typeof DIGITAL_CATEGORIES)[number];
