import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { index as libraryIndex } from '@/routes/marketplace/library';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface Props {
    purchase: { id: number; status: string };
    productName: string;
    fileUrl: string;
}

export default function Reader({ productName, fileUrl }: Props) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [containerWidth, setContainerWidth] = useState<number>(700);

    const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (!node) { return; }
        const ro = new ResizeObserver(([entry]) => {
            setContainerWidth(Math.min(entry.contentRect.width, 860));
        });
        ro.observe(node);
    }, []);

    const prev = () => setPageNumber((p) => Math.max(1, p - 1));
    const next = () => setPageNumber((p) => Math.min(numPages, p + 1));

    return (
        <>
            <Head title={`${productName} — Reader`} />

            <div className="flex h-screen flex-col bg-zinc-950 text-white">
                {/* Top bar */}
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-5">
                    <p className="max-w-xs truncate text-sm font-semibold">{productName}</p>
                    <p className="text-xs text-zinc-400">
                        {numPages > 0 ? `${pageNumber} / ${numPages}` : ''}
                    </p>
                    <button
                        type="button"
                        onClick={() => router.visit(libraryIndex().url)}
                        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-zinc-400 transition hover:bg-white/10 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                        Close
                    </button>
                </div>

                {/* PDF viewport */}
                <div
                    ref={containerRef}
                    className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-6"
                >
                    <Document
                        file={fileUrl}
                        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                        loading={
                            <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
                                Loading…
                            </div>
                        }
                        error={
                            <div className="flex h-64 items-center justify-center text-sm text-red-400">
                                Failed to load document.
                            </div>
                        }
                    >
                        <Page
                            pageNumber={pageNumber}
                            width={containerWidth}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="shadow-2xl"
                        />
                    </Document>
                </div>

                {/* Page controls */}
                {numPages > 1 && (
                    <div className="flex h-12 shrink-0 items-center justify-center gap-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={prev}
                            disabled={pageNumber <= 1}
                            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                        >
                            <ChevronLeft className="h-4 w-4" /> Prev
                        </button>
                        <span className="text-xs text-zinc-500">{pageNumber} / {numPages}</span>
                        <button
                            type="button"
                            onClick={next}
                            disabled={pageNumber >= numPages}
                            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
