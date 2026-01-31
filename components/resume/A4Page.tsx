import { ReactNode } from 'react';

interface A4PageProps {
  children: ReactNode;
  className?: string;
}

/**
 * A4Page Component
 * 
 * A container that simulates an A4 paper sheet (210mm x 297mm).
 * Provides a professional paper-like appearance with shadow and centered layout.
 * Print-friendly with appropriate margins.
 */
export function A4Page({ children, className = '' }: A4PageProps) {
  return (
    <div className="min-h-screen bg-slate-100 py-8 print:py-0 print:bg-white">
      <div className="mx-auto px-6 print:px-0">
        <div
          className={`
            mx-auto
            bg-white
            shadow-lg
            print:shadow-none
            ${className}
          `}
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '8mm 10mm 10mm 10mm',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
