import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
    type: ToastType;
    message: string;
}

interface ToastState {
    message: string;
    id: string;
}

const ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />,
    error:   <XCircle      className="h-5 w-5 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
};

const STYLES: Record<ToastType, { wrap: string; title: string; body: string; btn: string }> = {
    success: {
        wrap:  'bg-green-50 border-green-200',
        title: 'text-green-800',
        body:  'text-green-700',
        btn:   'text-green-600 hover:bg-green-100',
    },
    error: {
        wrap:  'bg-red-50 border-red-200',
        title: 'text-red-800',
        body:  'text-red-700',
        btn:   'text-red-600 hover:bg-red-100',
    },
    warning: {
        wrap:  'bg-amber-50 border-amber-200',
        title: 'text-amber-800',
        body:  'text-amber-700',
        btn:   'text-amber-600 hover:bg-amber-100',
    },
};

const LABELS: Record<ToastType, string> = {
    success: 'Success',
    error:   'Error',
    warning: 'Warning',
};

function Toast({ type, message }: ToastProps) {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);

    const dismiss = () => {
        setExiting(true);
        setTimeout(() => setVisible(false), 300);
    };

    useEffect(() => {
        if (!message) { return; }

        setVisible(true);
        setExiting(false);

        const timer = setTimeout(dismiss, 7000);
        return () => clearTimeout(timer);
    }, [message]);

    if (!visible || !message) { return null; }

    const s = STYLES[type];

    return (
        <div
            className={`transition-all duration-300 ${
                exiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
            }`}
        >
            <div className={`w-80 rounded-lg border shadow-lg p-4 ${s.wrap}`}>
                <div className="flex items-start gap-3">
                    {ICONS[type]}
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${s.title}`}>{LABELS[type]}</p>
                        <p className={`text-sm mt-0.5 ${s.body}`}>{message}</p>
                    </div>
                    <button
                        onClick={dismiss}
                        className={`p-1 rounded-md transition-colors shrink-0 ${s.btn}`}
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
    const { flash } = usePage().props;

    const [toasts, setToasts] = useState<Record<ToastType, ToastState | null>>({
        success: null,
        error:   null,
        warning: null,
    });

    useEffect(() => {
        const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

        if (flash.success) { setToasts(p => ({ ...p, success: { message: flash.success!, id: uid() } })); }
        if (flash.error)   { setToasts(p => ({ ...p, error:   { message: flash.error!,   id: uid() } })); }
        if (flash.warning) { setToasts(p => ({ ...p, warning: { message: flash.warning!, id: uid() } })); }
    }, [flash]);

    return (
        <>
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                <div className="pointer-events-auto flex flex-col gap-2">
                    {toasts.success && <Toast key={toasts.success.id} type="success" message={toasts.success.message} />}
                    {toasts.error   && <Toast key={toasts.error.id}   type="error"   message={toasts.error.message}   />}
                    {toasts.warning && <Toast key={toasts.warning.id} type="warning" message={toasts.warning.message} />}
                </div>
            </div>
            {children}
        </>
    );
}
