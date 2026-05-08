import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-baseline font-brand font-bold uppercase", className)}>
      <span className="text-[#B22C3E]">RAYANNN</span>
      <span className="text-[#B22C3E]">.</span>
      <span 
        className="text-transparent" 
        style={{ WebkitTextStroke: '1.5px #B22C3E' }}
      >
        VERSE
      </span>
    </div>
  );
}

export function Badge({ className, fixed = false }: { className?: string; fixed?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 border border-brand-red/30 rounded-full bg-bg-matte/50 backdrop-blur-sm shadow-[0_0_15px_rgba(178,44,62,0.1)]",
      fixed ? "fixed bottom-6 left-6 z-[60]" : "",
      className
    )}>
      <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-[pulse_1.5s_infinite]" />
      <span className="text-brand-red font-brand text-xs tracking-[3px] uppercase">
        Available for Projects
      </span>
    </div>
  );
}
