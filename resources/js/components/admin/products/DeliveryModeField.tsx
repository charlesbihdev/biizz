import { BookOpen, Download, ExternalLink } from 'lucide-react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type DeliveryMode = 'reader' | 'download' | 'external_link' | '';

type ModeId = Exclude<DeliveryMode, ''>;

interface ModeTile {
    id: ModeId;
    icon: typeof BookOpen;
    title: string;
    blurb: string;
}

const MODES: ModeTile[] = [
    {
        id: 'reader',
        icon: BookOpen,
        title: 'Secure reader',
        blurb: 'PDF opens inside biizz. Buyers cannot download or print.',
    },
    {
        id: 'download',
        icon: Download,
        title: 'Direct download',
        blurb: 'Buyers download the original file (PDF, ZIP, EPUB).',
    },
    {
        id: 'external_link',
        icon: ExternalLink,
        title: 'External link',
        blurb: 'Redirect to your hosted content (Teachable, Notion, Drive).',
    },
];

interface Props {
    mode: DeliveryMode;
    externalUrl: string;
    digitalFile: File | null;
    existingFileName?: string;
    errors: {
        delivery_mode?: string;
        external_url?: string;
        digital_file?: string;
    };
    onModeChange: (mode: DeliveryMode) => void;
    onExternalUrlChange: (url: string) => void;
    onFileChange: (file: File | null) => void;
}

export function DeliveryModeField({
    mode,
    externalUrl,
    digitalFile,
    existingFileName,
    errors,
    onModeChange,
    onExternalUrlChange,
    onFileChange,
}: Props) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-site-border bg-white p-4">
            <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold tracking-wide text-site-muted uppercase">
                    How buyers get this <span className="text-red-500">*</span>
                </p>
                <p className="text-xs text-site-muted">
                    Pick the way buyers receive your product after they pay.
                </p>
            </div>

            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Delivery mode">
                {MODES.map(({ id, icon: Icon, title, blurb }) => {
                    const selected = mode === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => onModeChange(id)}
                            className={cn(
                                'group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all',
                                selected
                                    ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                                    : 'border-site-border bg-white hover:border-brand/40',
                            )}
                        >
                            <div
                                className={cn(
                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                                    selected
                                        ? 'bg-brand text-white'
                                        : 'bg-site-surface text-site-muted group-hover:text-brand',
                                )}
                            >
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-1 flex-col gap-0.5">
                                <p
                                    className={cn(
                                        'text-sm font-semibold',
                                        selected ? 'text-brand' : 'text-site-fg',
                                    )}
                                >
                                    {title}
                                </p>
                                <p className="text-xs leading-snug text-site-muted">
                                    {blurb}
                                </p>
                            </div>
                            <span
                                className={cn(
                                    'mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                    selected
                                        ? 'border-brand bg-brand'
                                        : 'border-site-border bg-white',
                                )}
                            >
                                {selected && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>
            <InputError message={errors.delivery_mode} />

            {(mode === 'reader' || mode === 'download') && (
                <FileUploadSlot
                    accept={mode === 'reader' ? '.pdf' : '.pdf,.zip,.epub'}
                    hint={
                        mode === 'reader'
                            ? 'PDF only. Up to 50 MB.'
                            : 'PDF, ZIP, or EPUB. Up to 50 MB.'
                    }
                    file={digitalFile}
                    existingFileName={existingFileName}
                    error={errors.digital_file}
                    onChange={onFileChange}
                />
            )}

            {mode === 'external_link' && (
                <div className="flex flex-col gap-2 rounded-xl border border-dashed border-site-border bg-site-surface/40 p-3">
                    <Label
                        htmlFor="external_url"
                        className="text-xs font-semibold text-site-fg"
                    >
                        Destination URL <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="external_url"
                        type="url"
                        value={externalUrl}
                        placeholder="https://teachable.com/p/your-course"
                        onChange={(e) => onExternalUrlChange(e.target.value)}
                        className="border-site-border bg-white focus-visible:ring-brand/30"
                    />
                    <p className="text-xs text-site-muted">
                        Where buyers go after purchase. Opens in a new tab.
                    </p>
                    <InputError message={errors.external_url} />
                </div>
            )}
        </div>
    );
}

interface FileUploadSlotProps {
    accept: string;
    hint: string;
    file: File | null;
    existingFileName?: string;
    error?: string;
    onChange: (file: File | null) => void;
}

function FileUploadSlot({
    accept,
    hint,
    file,
    existingFileName,
    error,
    onChange,
}: FileUploadSlotProps) {
    return (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-site-border bg-site-surface/40 p-3">
            {existingFileName && !file && (
                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    Current file: {existingFileName}
                </div>
            )}
            <Input
                type="file"
                accept={accept}
                onChange={(e) => onChange(e.target.files?.[0] || null)}
                className="cursor-pointer border-site-border bg-white text-sm file:mr-4 file:rounded-full file:border-0 file:bg-brand/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-brand hover:file:bg-brand/20 focus-visible:ring-brand/30"
            />
            <p className="text-xs text-site-muted">{hint}</p>
            <InputError message={error} />
        </div>
    );
}
