'use client';

import React from 'react';

interface LoaderProps {
  label?: string;
  className?: string;
}

// Indicador de carga animado para que el usuario sepa que la página sigue trabajando.
export default function Loader({ label = 'Cargando...', className = '' }: LoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-10 ${className}`}>
      <div className="relative w-11 h-11 shrink-0">
        <div className="absolute inset-0 rounded-full border-4 border-[#efe3db]" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#6f5249] animate-spin" />
      </div>
      <p className="mt-4 text-xs font-semibold text-[#7c6b64] flex items-center gap-2">
        {label}
        <span className="inline-flex gap-1 items-center">
          <span className="w-1 h-1 rounded-full bg-[#6f5249] animate-bounce" />
          <span className="w-1 h-1 rounded-full bg-[#6f5249] animate-bounce [animation-delay:150ms]" />
          <span className="w-1 h-1 rounded-full bg-[#6f5249] animate-bounce [animation-delay:300ms]" />
        </span>
      </p>
    </div>
  );
}