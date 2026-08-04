import { Clock3, Phone, RefreshCw, ReceiptText } from 'lucide-react';
import { AdminHeader } from '../components/AdminHeader';
import { useWowfoodStore } from '../store/useWowfoodStore';
import type { OrderStatus } from '../types';
import { formatMoney, phoneTail, sortByPickupTime, statusLabel } from '../utils/format';

const statusTone: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  preparing: 'bg-blue-50 text-blue-700',
  ready: 'bg-brand-mint text-brand-green',
  completed: 'bg-slate-100 text-slate-500'
};

export default function AdminOrdersPage() {
  const orders = useWowfoodStore((state) => state.orders);
  const advanceOrderStatus = useWowfoodStore((state) => state.advanceOrderStatus);
  const todaysOrders = [...orders].sort(sortByPickupTime);
  const activeCount = todaysOrders.filter((order) => order.status !== 'completed').length;

  return (
    <main className="min-h-screen pb-8">
      <AdminHeader />

      <section className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white p-4">
            <p className="text-sm text-slate-500">待处理</p>
            <p className="mt-1 text-3xl font-black">{activeCount}</p>
          </div>
          <div className="rounded-lg bg-white p-4">
            <p className="text-sm text-slate-500">今日订单</p>
            <p className="mt-1 text-3xl font-black">{todaysOrders.length}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3 px-4">
        {todaysOrders.length === 0 ? (
          <div className="rounded-lg bg-white px-5 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <ReceiptText size={26} />
            </div>
            <h2 className="mt-4 text-lg font-bold">暂无订单</h2>
            <p className="mt-2 text-sm text-slate-500">顾客提交后会显示在这里。</p>
          </div>
        ) : null}

        {todaysOrders.map((order) => (
          <article key={order.id} className="rounded-lg bg-white p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">取餐号</p>
                <h2 className="mt-1 text-4xl font-black">{order.displayNumber}</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusTone[order.status]}`}>
                {statusLabel[order.status]}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="flex items-center gap-1 text-slate-500">
                  <Clock3 size={15} />
                  取货时间
                </p>
                <p className="mt-1 text-lg font-bold">{order.pickupTime}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="flex items-center gap-1 text-slate-500">
                  <Phone size={15} />
                  手机尾号
                </p>
                <p className="mt-1 text-lg font-bold">{phoneTail(order.phone)}</p>
              </div>
            </div>

            <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-100">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.productId}`} className="flex justify-between gap-3 px-3 py-3">
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-semibold">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.unit} · x{item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-bold">{formatMoney(item.subtotal)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">辣度</span>
                <span className="font-semibold">{order.spice}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">备注</span>
                <span className="max-w-[70%] text-right font-semibold">{order.remark || '无'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">应收</span>
                <span className="text-xl font-black">{formatMoney(order.total)}</span>
              </div>
            </div>

            <button
              disabled={order.status === 'completed'}
              onClick={() => advanceOrderStatus(order.id)}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-green font-semibold text-white disabled:bg-slate-300"
            >
              <RefreshCw size={18} />
              {order.status === 'completed' ? '已完成' : `切换为下一状态`}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
