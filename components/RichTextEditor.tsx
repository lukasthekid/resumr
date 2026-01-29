"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";

export function RichTextEditor({
  content,
  onChange,
  editable = true,
}: {
  content: string;
  onChange?: (html: string) => void;
  editable?: boolean;
}) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-slate-950">
      {editable && (
        <div className="flex items-center gap-1 border-b border-white/10 bg-white/5 px-2 py-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={[
              "rounded px-2 py-1 text-xs font-semibold transition-colors",
              editor.isActive("bold")
                ? "bg-sky-500 text-white"
                : "text-slate-300 hover:bg-white/10",
            ].join(" ")}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={[
              "rounded px-2 py-1 text-xs font-semibold italic transition-colors",
              editor.isActive("italic")
                ? "bg-sky-500 text-white"
                : "text-slate-300 hover:bg-white/10",
            ].join(" ")}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={[
              "rounded px-2 py-1 text-xs font-semibold underline transition-colors",
              editor.isActive("underline")
                ? "bg-sky-500 text-white"
                : "text-slate-300 hover:bg-white/10",
            ].join(" ")}
          >
            U
          </button>
          <div className="mx-2 h-4 w-px bg-white/10" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={[
              "rounded px-2 py-1 text-xs transition-colors",
              editor.isActive("bulletList")
                ? "bg-sky-500 text-white"
                : "text-slate-300 hover:bg-white/10",
            ].join(" ")}
          >
            • List
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
