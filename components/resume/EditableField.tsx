"use client";

import { useEffect, useRef, useState } from 'react';

interface EditableFieldProps {
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
}

/**
 * EditableField Component
 * 
 * A component that looks like regular text but acts as an input field.
 * Provides inline editing capabilities with visual feedback on focus.
 * 
 * Features:
 * - Transparent by default, subtle blue background on focus
 * - Auto-resizing textarea for multiline content
 * - Graceful handling of undefined values
 * - Seamless integration with resume text styling
 */
export function EditableField({
  value,
  onChange,
  className = '',
  placeholder = '',
  multiline = false,
  disabled = false,
}: EditableFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // Ensure we always have a string value
  const safeValue = value ?? '';

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (multiline && textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set height to scrollHeight to fit content
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [safeValue, multiline]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const baseClassName = `
    w-full
    bg-transparent
    border-none
    outline-none
    transition-all
    duration-200
    resize-none
    ${isFocused ? 'bg-blue-50 ring-2 ring-blue-200 rounded px-1' : ''}
    ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-text'}
    ${className}
  `;

  if (multiline) {
    return (
      <textarea
        ref={textareaRef}
        value={safeValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={baseClassName}
        rows={1}
        style={{
          overflow: 'hidden',
          minHeight: '1.2em',
        }}
      />
    );
  }

  return (
    <input
      type="text"
      value={safeValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={baseClassName}
    />
  );
}
