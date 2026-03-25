import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Heading2, Minus, List, ListOrdered } from 'lucide-react';

interface Props {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export function RichDescriptionEditor({ value, onChange, placeholder }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: placeholder ?? 'Write a detailed product description...' }),
        ],
        content: value,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    if (!editor) { return null; }

    const btn = (active: boolean) =>
        `rounded p-1.5 transition hover:bg-site-surface ${active ? 'bg-site-surface text-site-fg' : 'text-site-muted'}`;

    return (
        <div className="overflow-hidden rounded-lg border border-site-border focus-within:ring-2 focus-within:ring-brand/30">
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 border-b border-site-border bg-site-surface/60 px-2 py-1">
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))}>
                    <Bold className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))}>
                    <Italic className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))}>
                    <Heading2 className="h-3.5 w-3.5" />
                </button>
                <div className="mx-1 h-4 w-px bg-site-border" />
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))}>
                    <List className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))}>
                    <ListOrdered className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btn(false)}>
                    <Minus className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Editor area */}
            <EditorContent
                editor={editor}
                className="prose prose-sm max-w-none px-3 py-2 text-site-fg [&_.ProseMirror]:min-h-[80px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-site-muted [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
            />
        </div>
    );
}
