import { ClipboardList, Utensils } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useWowfoodStore } from '../store/useWowfoodStore';

export function CustomerTabBar() {
  const orders = useWowfoodStore((state) => state.orders);
  const customerPhone = useWowfoodStore((state) => state.customerPhone);
  const currentOrderId = useWowfoodStore((state) => state.currentOrderId);

  const activeOrderCount = orders.filter((order) => {
    const belongsToCustomer =
      (customerPhone && order.phone === customerPhone) || order.id === currentOrderId;
    return belongsToCustomer && order.status !== 'completed';
  }).length;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] border-t border-slate-200 bg-white px-6 pb-safe-bottom pt-2">
      <div className="grid grid-cols-2 gap-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-semibold ${
              isActive ? 'text-brand-green' : 'text-slate-400'
            }`
          }
        >
          <Utensils size={22} />
          点餐
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `relative flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-semibold ${
              isActive ? 'text-brand-green' : 'text-slate-400'
            }`
          }
        >
          <ClipboardList size={22} />
          订单
          {activeOrderCount > 0 ? (
            <span className="absolute left-1/2 top-1 ml-4 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1 text-xs text-white">
              {activeOrderCount}
            </span>
          ) : null}
        </NavLink>
      </div>
    </nav>
  );
}
