import { LockKeyhole } from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';
import { useWowfoodStore } from '../store/useWowfoodStore';

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const settings = useWowfoodStore((state) => state.settings);
  const adminUnlocked = useWowfoodStore((state) => state.adminUnlocked);
  const setAdminUnlocked = useWowfoodStore((state) => state.setAdminUnlocked);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pin === settings.adminPin) {
      setAdminUnlocked(true);
      setError('');
      return;
    }

    setError('PIN 不正确');
  }

  if (adminUnlocked) {
    return children;
  }

  return (
    <main className="flex min-h-screen flex-col justify-center px-5 py-8">
      <div className="rounded-lg bg-white p-5 shadow-soft">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-mint text-brand-green">
          <LockKeyhole size={24} />
        </div>
        <h1 className="text-2xl font-bold">姐姐端</h1>
        <p className="mt-2 text-sm text-slate-500">输入 4 位 PIN 进入管理页面。</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">PIN</span>
            <input
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
              inputMode="numeric"
              autoComplete="one-time-code"
              className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-lg tracking-[0.2em] outline-none focus:border-brand-green"
              placeholder="1666"
            />
          </label>
          {error ? <p className="text-sm text-brand-red">{error}</p> : null}
          <button className="h-12 w-full rounded-lg bg-brand-green font-semibold text-white">
            进入
          </button>
        </form>
      </div>
    </main>
  );
}
