import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { index as libraryIndex } from '@/routes/marketplace/library';
import { useEffect, useState } from 'react';

interface Props {
    productName: string;
    pageNumber: number;
    numPages: number;
    onPrev: () => void;
    onNext: () => void;
}

export default function ControlsOverlay({ productName, pageNumber, numPages, onPrev, onNext }: Props) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        let timeout: any;
        const hide = () => setVisible(false);
        const reset = () => {
            setVisible(true);
            clearTimeout(timeout);
            timeout = setTimeout(hide, 4000);
        };

        window.addEventListener('mousemove', reset);
        reset();

        return () => {
            window.removeEventListener('mousemove', reset);
            clearTimeout(timeout);
        };
    }, []);

    const handleClose = () => router.visit(libraryIndex().url);

    return (
        <>
            {/* Top Bar */}
            <div className={cn(
                "fixed top-0 inset-x-0 z-[60] flex h-16 items-center justify-between border-b border-white/5 bg-zinc-950/80 px-6 backdrop-blur-xl transition-all duration-500",
                visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
            )}>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleClose}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="h-10 w-px bg-white/5" />
                    <p className="max-w-[200px] truncate text-sm font-black tracking-tight text-white sm:max-w-md">
                        {productName}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="mr-4 hidden items-center gap-2 rounded-xl bg-white/5 p-1 sm:flex">
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"><ZoomOut className="h-4 w-4" /></button>
                        <span className="px-2 text-[10px] font-black tracking-tighter text-zinc-400 uppercase">100%</span>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"><ZoomIn className="h-4 w-4" /></button>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className={cn(
                "fixed bottom-8 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-6 rounded-2xl border border-white/10 bg-zinc-950/90 p-4 shadow-2xl backdrop-blur-2xl transition-all duration-500",
                visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            )}>
                <button
                    onClick={onPrev}
                    disabled={pageNumber <= 1}
                    className="flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-black text-zinc-400 transition-all hover:bg-white/5 hover:text-white disabled:opacity-20"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back</span>
                </button>
                
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Page</span>
                    <span className="text-sm font-black text-white">{pageNumber} <span className="text-zinc-600">/ {numPages || '...'}</span></span>
                </div>

                <button
                    onClick={onNext}
                    disabled={pageNumber >= numPages}
                    className="flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-black text-zinc-400 transition-all hover:bg-white/5 hover:text-white disabled:opacity-20"
                >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
            
            {/* Focus Shadow overlay when UI hides */}
            <div className={cn(
                "pointer-events-none fixed inset-0 z-40 bg-zinc-950/20 transition-opacity duration-1000",
                visible ? "opacity-0" : "opacity-100"
            )} />
        </>
    );
}
