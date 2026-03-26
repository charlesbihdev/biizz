import type { CSSProperties } from 'react';
import parse from 'html-react-parser';
import { cn } from '@/lib/utils';

// --- Tiptap Node Styles (ensure parity with editor) ---
import "@/components/tiptap/node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap/node/code-block-node/code-block-node.scss";
import "@/components/tiptap/node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap/node/list-node/list-node.scss";
import "@/components/tiptap/node/image-node/image-node.scss";
import "@/components/tiptap/node/heading-node/heading-node.scss";
import "@/components/tiptap/node/paragraph-node/paragraph-node.scss";

interface Props {
    content:      string;
    className?:   string;
    primaryColor?: string;
}

/**
 * TiptapRenderer
 * 
 * A modern, safe way to render Tiptap HTML content using `html-react-parser`.
 * It applies the `prose` classes (from @tailwindcss/typography)
 * and leverages the CSS tokens for the business theme.
 */
export default function TiptapRenderer({ content, className, primaryColor }: Props) {
    if (!content) return null;

    const style: CSSProperties = primaryColor ? {
        '--tw-prose-body':     primaryColor + 'cc',
        '--tw-prose-headings': primaryColor,
        '--tw-prose-links':    primaryColor,
        '--tw-prose-bold':     primaryColor,
        '--tw-prose-counters': primaryColor + '80',
        '--tw-prose-bullets':  primaryColor + '80',
        '--tw-prose-hr':       primaryColor + '1a',
        '--tw-prose-quotes':   primaryColor,
        '--tw-prose-code':     primaryColor,
    } as CSSProperties : {};

    // html-react-parser converts the HTML string into React elements
    // This is safer than dangerouslySetInnerHTML.
    const parsedContent = parse(content);

    return (
        <div
            className={cn(
                "prose prose-zinc max-w-none transition-all duration-300",
                "prose-headings:font-bold prose-p:leading-relaxed",
                "prose-img:rounded-2xl prose-img:shadow-lg",
                className
            )}
            style={style}
        >
            {parsedContent}
        </div>
    );
}
