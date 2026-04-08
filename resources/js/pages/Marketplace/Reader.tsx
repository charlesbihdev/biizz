import { Head } from '@inertiajs/react';
import { useState } from 'react';
import SecurityLayer from './Components/Reader/SecurityLayer';
import Viewport from './Components/Reader/Viewport';
import ControlsOverlay from './Components/Reader/ControlsOverlay';

interface Props {
    purchase: { id: number; status: string };
    productName: string;
    fileUrl: string;
}

export default function Reader({ productName, fileUrl }: Props) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);

    const prev = () => setPageNumber((p) => Math.max(1, p - 1));
    const next = () => setPageNumber((p) => Math.min(numPages, p + 1));

    return (
        <div className="relative h-screen w-full overflow-hidden bg-zinc-950 text-white selection:bg-brand/30">
            <Head title={`${productName} — biizz Secure Reader`} />

            {/* Security Infrastructure */}
            <SecurityLayer />

            <div className="flex h-full flex-col">
                {/* PDF Viewport */}
                <Viewport 
                    fileUrl={fileUrl} 
                    pageNumber={pageNumber} 
                    onLoadSuccess={({ numPages: n }) => setNumPages(n)} 
                />

                {/* Overlays (Floating Controls) */}
                <ControlsOverlay 
                    productName={productName}
                    pageNumber={pageNumber}
                    numPages={numPages}
                    onPrev={prev}
                    onNext={next}
                />
            </div>
            
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -top-1/4 -left-1/4 h-1/2 w-1/2 rounded-full bg-brand/5 blur-[160px]" />
            <div className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-blue-500/5 blur-[160px]" />
        </div>
    );
}
