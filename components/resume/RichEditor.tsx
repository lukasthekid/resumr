"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  className?: string;
  placeholder?: string;
  editable?: boolean;
}

/**
 * RichEditor Component
 * 
 * A seamless rich text editor using Tiptap that looks like part of the document.
 * Supports bold, italic, bullet lists, and ordered lists via keyboard shortcuts.
 * 
 * Keyboard Shortcuts:
 * - Cmd/Ctrl + B: Bold
 * - Cmd/Ctrl + I: Italic
 * - Cmd/Ctrl + Shift + 7: Ordered List
 * - Cmd/Ctrl + Shift + 8: Bullet List
 * 
 * @example
 * ```tsx
 * <RichEditor
 *   content={achievement}
 *   onChange={(html) => updateAchievement(html)}
 *   placeholder="Describe your achievement..."
 * />
 * ```
 */
export function RichEditor({
  content,
  onChange,
  className = '',
  placeholder = '',
  editable = true,
}: RichEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Configure which features to enable
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        bold: {
          HTMLAttributes: {
            class: 'font-semibold',
          },
        },
        italic: {
          HTMLAttributes: {
            class: 'italic',
          },
        },
        // Disable features we don't need
        heading: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
      }),
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none ${className}`.trim(),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-editor-container">
      <EditorContent editor={editor} />
      
      {/* Styles for the editor content */}
      <style jsx global>{`
        /* Editor container */
        .ProseMirror {
          outline: none;
          min-height: 1.5em;
        }

        /* Placeholder */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }

        /* Focus state - subtle blue background */
        .ProseMirror:focus {
          background-color: #eff6ff;
          border-radius: 4px;
          padding: 2px 4px;
          margin: -2px -4px;
        }

        /* Paragraphs */
        .ProseMirror p {
          margin: 0;
          line-height: 1.5;
        }

        .ProseMirror p:not(:last-child) {
          margin-bottom: 0.5em;
        }

        /* Bold text */
        .ProseMirror strong,
        .ProseMirror b {
          font-weight: 600;
        }

        /* Italic text */
        .ProseMirror em,
        .ProseMirror i {
          font-style: italic;
        }

        /* Lists */
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .ProseMirror ul {
          list-style-type: disc;
        }

        .ProseMirror ol {
          list-style-type: decimal;
        }

        .ProseMirror li {
          margin: 0.25em 0;
          line-height: 1.5;
        }

        .ProseMirror li p {
          margin: 0;
        }

        /* Nested lists */
        .ProseMirror ul ul,
        .ProseMirror ol ul {
          list-style-type: circle;
        }

        .ProseMirror ul ul ul,
        .ProseMirror ol ul ul,
        .ProseMirror ol ol ul {
          list-style-type: square;
        }

        .ProseMirror ol ol,
        .ProseMirror ul ol {
          list-style-type: lower-alpha;
        }

        /* Remove default margins on first/last children */
        .ProseMirror > *:first-child {
          margin-top: 0;
        }

        .ProseMirror > *:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}

/**
 * Read-only version of RichEditor for displaying formatted content
 */
export function RichEditorReadOnly({
  content,
  className = '',
}: {
  content: string;
  className?: string;
}) {
  return (
    <RichEditor
      content={content}
      onChange={() => {}}
      className={className}
      editable={false}
    />
  );
}
