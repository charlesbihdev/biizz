import { store as mediaStore } from '@/routes/businesses/media';

export async function uploadMedia(file: File, businessSlug: string): Promise<string> {
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(mediaStore({ business: businessSlug }).url, {
        method: 'POST',
        body: form,
        headers: {
            'X-CSRF-TOKEN':
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)
                    ?.content ?? '',
        },
    });

    if (!res.ok) {
        throw new Error('Upload failed');
    }

    const { url } = (await res.json()) as { url: string };
    return url;
}
