import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';

type Props = {
    label: string;
    error?: string;
    children: React.ReactNode;
};

export function Field({ label, error, children }: Props) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label>{label}</Label>
            {children}
            {error && <InputError message={error} />}
        </div>
    );
}
