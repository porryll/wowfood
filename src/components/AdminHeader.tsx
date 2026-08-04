import { ClipboardList, LogOut, MenuSquare, Power } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useWowfoodStore } from '../store/useWowfoodStore';

export function AdminHeader() {
  const setAdminUnlocked = useWowfoodStore((state) => state.setAdminUnlocked);
  const settings = useWowfoodStore((state) => state.settings);
  const toggleAcceptingOrders = useWowfoodStore((state) => state.toggleAcceptingOrders);
  const updateSettings = useWowfoodStore((state) => state.updateSettings);
  const acceptingOrders = settings.acceptingOrders ?? true;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 pb-3 pt-safe-top backdrop-blur">
      <div className="flex items-center justify-between pt-3">
        <div>
          <p className={`text-xs font-medium ${acceptingOrders ? 'text-brand-green' : 'text-amber-600'}`}>
            {acceptingOrders ? '正在接单' : '暂停接单'}
          </p>
          <h1 className="text-xl font-bold">姐姐端</h1>
        </div>
        <button
          onClick={() => setAdminUnlocked(false)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600"
          aria-label="退出姐姐端"
        >
          <LogOut size={18} />
        </button>
      </div>
      <nav className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold ${
              isActive ? 'bg-white text-brand-green shadow-sm' : 'text-slate-500'
            }`
          }
        >
          <ClipboardList size={16} />
          订单
        </NavLink>
        <NavLink
          to="/admin/menu"
          className={({ isActive }) =>
            `flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold ${
              isActive ? 'bg-white text-brand-green shadow-sm' : 'text-slate-500'
            }`
          }
        >
          <MenuSquare size={16} />
          菜单
        </NavLink>
      </nav>
      <div
        className={`mt-3 rounded-lg p-3 ${
          acceptingOrders ? 'bg-brand-mint text-brand-green' : 'bg-amber-50 text-amber-700'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold">{acceptingOrders ? '营业中' : '暂停接单'}</p>
            <p className="mt-0.5 text-xs opacity-80">
              {acceptingOrders ? '顾客可以正常提交订单' : '顾客暂时不能提交订单'}
            </p>
          </div>
          <button
            onClick={toggleAcceptingOrders}
            className={`flex h-11 min-w-28 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-white ${
              acceptingOrders ? 'bg-brand-green' : 'bg-amber-600'
            }`}
          >
            <Power size={16} />
            {acceptingOrders ? '暂停' : '开始'}
          </button>
        </div>
        {!acceptingOrders ? (
          <input
            value={settings.pauseMessage}
            onChange={(event) => updateSettings({ pauseMessage: event.target.value })}
            className="mt-3 h-10 w-full rounded-lg border border-amber-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-amber-500"
            placeholder="今天暂不接单，请稍后再来。"
          />
        ) : null}
      </div>
      {window.location.port === '1666' ? null : (
        <Link to="/" className="mt-3 block text-center text-xs text-slate-400">
          返回顾客端
        </Link>
      )}
    </header>
  );
}
