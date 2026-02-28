"use client";

import { RichEditor } from './RichEditor';
import { Trash2 } from 'lucide-react';

interface EditableListItemProps {
  content: string;
  onChange: (html: string) => void;
  onRemove: () => void;
  placeholder?: string;
  className?: string;
}

/**
 * EditableListItem - A single editable list item with bullet, rich content, and remove button
 *
 * Used for achievements, project descriptions, education highlights, etc.
 * Trash icon appears on hover for a clean document-like look.
 */
export function EditableListItem({
  content,
  onChange,
  onRemove,
  placeholder = '',
  className = '',
}: EditableListItemProps) {
  return (
    <li className={`group flex items-start gap-2 text-xs ${className}`}>
      <span className="text-gray-400 mt-1 flex-shrink-0">•</span>
      <div className="flex-1 min-w-0">
        <RichEditor
          content={content}
          onChange={onChange}
          placeholder={placeholder}
          className="text-gray-700 leading-relaxed"
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove item"
        className="flex-shrink-0 mt-1 p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity print:hidden"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}
