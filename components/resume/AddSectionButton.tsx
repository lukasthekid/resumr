"use client";

import { Plus } from 'lucide-react';

interface AddSectionButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
}

/**
 * AddSectionButton - Button to add a new section entry (work experience, education, project, etc.)
 */
export function AddSectionButton({
  onClick,
  label,
  className = '',
}: AddSectionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 mt-3 text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1.5 rounded transition-colors print:hidden ${className}`}
    >
      <Plus className="w-3.5 h-3.5" />
      <span>Add {label}</span>
    </button>
  );
}
