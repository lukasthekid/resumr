"use client";

import { Trash2 } from 'lucide-react';

interface EditableSectionItemProps {
  children: React.ReactNode;
  onRemove: () => void;
  className?: string;
}

/**
 * EditableSectionItem - Wraps a full section entry (work experience, education, project) with remove button
 *
 * Trash icon appears on hover in top-right corner.
 */
export function EditableSectionItem({
  children,
  onRemove,
  className = '',
}: EditableSectionItemProps) {
  return (
    <div className={`group relative ${className}`}>
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove entry"
        className="absolute top-0 right-0 p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity print:hidden"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
