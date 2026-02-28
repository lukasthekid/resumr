"use client";

import { Plus } from 'lucide-react';

interface AddListItemButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
}

/**
 * AddListItemButton - Button to add a new list item (achievement, description, highlight, etc.)
 */
export function AddListItemButton({
  onClick,
  label,
  className = '',
}: AddListItemButtonProps) {
  return (
    <li className="list-none">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 mt-2 text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors print:hidden ${className}`}
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add {label}</span>
      </button>
    </li>
  );
}
