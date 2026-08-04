import type { ReactNode } from 'react';

interface AppFrameProps {
  children: ReactNode;
}

export function AppFrame({ children }: AppFrameProps) {
  return (
    <div className="min-h-screen bg-[#f5f7f5] text-slate-950">
      <div className="mx-auto min-h-screen w-full max-w-[480px] bg-[#f5f7f5] shadow-soft">
        {children}
      </div>
    </div>
  );
}
