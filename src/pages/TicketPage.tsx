import { ArrowLeft, CheckCircle2, Clock3, Phone, ReceiptText } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CustomerTabBar } from '../components/CustomerTabBar';
import { useWowfoodStore } from '../store/useWowfoodStore';
import type { OrderStatus } from '../types';
import { formatMoney, phoneTail, statusLabel } from '../utils/format';

const statusSteps: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed'];

export default function TicketPage() {
  const { orderId } = useParams();
  const orders = useWowfoodStore((state) => state.orders);
  const order = orders.find((candidate) => candidate.id === orderId);

  if (!order) {
    return <Navigate to="/" replace />;
  }

  const currentIndex = statusSteps.indexOf(order.status);

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white px-4 pb-3 pt-safe-top">
        <div className="flex items-center justify-between pt-3">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"
            aria-label="返回点餐"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold">取餐凭证</h1>
          <div className="h-10 w-10" />
        </div>
      </header>

      <section className="px-4 py-4">
        <div className="rounded-lg bg-brand-dark p-5 text-white">
          <p className="text-sm text-white/70">请向姐姐出示取餐号</p>
          <div className="mt-3 text-center text-7xl font-black tracking-wide">{order.displayNumber}</div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-white/10 p-3">
              <p className="text-white/60">取货时间</p>
              <p className="mt-1 text-lg font-bold">{order.pickupTime}</p>
            </div>
            <div className="rounded-lg bg-white/10 p-3">
              <p className="text-white/60">手机尾号</p>
              <p className="mt-1 text-lg font-bold">{phoneTail(order.phone)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4">
        <div className="rounded-lg bg-white p-4">
          <div className="mb-4 flex items-center gap-2 text-base font-bold">
            <Clock3 size={18} className="text-brand-green" />
            订单状态
          </div>
          <div className="grid grid-cols-4 gap-2">
            {statusSteps.map((status, index) => {
              const active = index <= currentIndex;
              return (
                <div key={status} className="text-center">
                  <div
                    className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${
                      active ? 'bg-brand-green text-white' : 'bg-slate-100 text-slate-300'
                    }`}
                  >
                    <CheckCircle2 size={18} />
                  </div>
                  <p className={`mt-2 text-xs font-medium ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                    {statusLabel[status]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-3 px-4">
        <div className="rounded-lg bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-base font-bold">
            <ReceiptText size={18} className="text-brand-green" />
            菜品明细
          </div>
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={`${item.productId}-${item.name}`} className="flex justify-between gap-3 py-3">
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
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-slate-500">现场应付</span>
            <span className="text-2xl font-bold">{formatMoney(order.total)}</span>
          </div>
        </div>
      </section>

      <section className="mt-3 px-4">
        <div className="space-y-3 rounded-lg bg-white p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-slate-500">
              <Phone size={16} />
              联系电话
            </span>
            <span className="font-semibold">{order.phone}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">辣度</span>
            <span className="font-semibold">{order.spice}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-slate-500">备注</span>
            <span className="max-w-[70%] text-right font-semibold">{order.remark || '无'}</span>
          </div>
        </div>
      </section>

      <div className="px-4 pb-safe-bottom pt-4">
        <Link
          to="/"
          className="flex h-12 items-center justify-center rounded-lg bg-brand-green font-semibold text-white"
        >
          继续点餐
        </Link>
      </div>
      <CustomerTabBar />
    </main>
  );
}
