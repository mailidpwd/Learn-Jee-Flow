import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type BackButtonProps = {
  label?: string;
  onClick?: () => void;
  className?: string;
};

export function BackButton({ label = 'Back', onClick, className }: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={
        `group relative inline-flex items-center gap-2 rounded-full px-4 py-2
         bg-white/70 hover:bg-white/80 text-slate-800 shadow-sm hover:shadow-md
         ring-1 ring-black/5 backdrop-blur transition-all duration-200
         hover:-translate-x-0.5 ${className || ''}`
      }
    >
      <span
        className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden
      />
      <ArrowLeft className="relative z-20 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
      <span className="relative z-20 font-medium text-slate-800">{label}</span>
    </Button>
  );
}

export default BackButton;


