import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useCallback, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface Props {
    fileUrl: string;
    pageNumber: number;
    onLoadSuccess: ({ numPages }: { numPages: number }) => void;
}

export default function Viewport({ fileUrl, pageNumber, onLoadSuccess }: Props) {
    const [containerWidth, setContainerWidth] = useState<number>(800);

    const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;
        const ro = new ResizeObserver(([entry]) => {
            setContainerWidth(Math.min(entry.contentRect.width - 40, 900));
        });
        ro.observe(node);
    }, []);

    return (
        <div 
            ref={containerRef}
            className="flex flex-1 flex-col items-center overflow-y-auto bg-zinc-900/50 px-4 py-12 scrollbar-thin scrollbar-thumb-white/10"
        >
            <div className="relative shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] transition-all duration-500">
                <Document
                    file={fileUrl}
                    onLoadSuccess={onLoadSuccess}
                    loading={
                        <div className="flex h-[600px] w-[500px] flex-col items-center justify-center gap-4 rounded-2xl bg-zinc-800/50">
                            <Loader2 className="h-8 w-8 animate-spin text-brand" />
                            <p className="text-sm font-bold text-zinc-400">Preparing canvas...</p>
                        </div>
                    }
                    error={
                        <div className="flex h-[600px] w-[500px] flex-col items-center justify-center gap-4 rounded-2xl bg-zinc-800/50 px-8 text-center">
                            <AlertCircle className="h-10 w-10 text-red-500" />
                            <h4 className="text-lg font-black text-white">Security Halt</h4>
                            <p className="text-sm font-medium text-zinc-400">Failed to load the secure document. Please refresh or contact support.</p>
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        width={containerWidth}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="overflow-hidden rounded-sm"
                    />
                </Document>
            </div>
        </div>
    );
}
