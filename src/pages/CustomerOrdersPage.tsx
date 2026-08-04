import { ChevronRight, ClipboardList, Phone, ShoppingBag } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CustomerTabBar } from '../components/CustomerTabBar';
import { useWowfoodStore } from '../store/useWowfoodStore';
import { formatMoney, maskPhone, statusLabel } from '../utils/format';

export default function CustomerOrdersPage() {
  const orders = useWowfoodStore((state) => state.orders);
  const customerPhone = useWowfoodStore((state) => state.customerPhone);
  const currentOrderId = useWowfoodStore((state) => state.currentOrderId);
  const setCustomerPhone = useWowfoodStore((state) => state.setCustomerPhone);
  const [phoneDraft, setPhoneDraft] = useState(customerPhone);

  const visibleOrders = useMemo(() => {
    return [...orders]
      .filter((order) => {
        if (customerPhone) return order.phone === customerPhone;
        return order.id === currentOrderId;
      })
      .sort((a, b) => {
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [customerPhone, currentOrderId, orders]);

  function handlePhoneSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCustomerPhone(phoneDraft.replace(/\D/g, '').slice(0, 11));
  }

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white px-4 pb-3 pt-safe-top">
        <div className="pt-3">
          <p className="text-xs font-medium text-brand-green">C 端</p>
          <h1 className="text-2xl font-bold">我的订单</h1>
        </div>
      </header>

      <section className="space-y-4 px-4 py-4">
        <div className="rounded-lg bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-mint text-brand-green">
              <Phone size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold">手机号识别</p>
              <p className="mt-1 text-sm text-slate-500">
                {customerPhone ? `当前查看 ${maskPhone(customerPhone)} 的订单` : '输入手机号查看本机订单'}
              </p>
            </div>
          </div>
          <form className="mt-4 flex gap-2" onSubmit={handlePhoneSubmit}>
            <input
              value={phoneDraft}
              onChange={(event) => setPhoneDraft(event.target.value.replace(/\D/g, '').slice(0, 11))}
              inputMode="tel"
              className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 outline-none focus:border-brand-green"
              placeholder="请输入手机号"
            />
            <button className="h-11 rounded-lg bg-brand-green px-4 font-semibold text-white">
              查看
            </button>
          </form>
        </div>

        {visibleOrders.length === 0 ? (
          <div className="rounded-lg bg-white px-5 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <ClipboardList size={26} />
            </div>
            <h2 className="mt-4 text-lg font-bold">还没有订单</h2>
            <p className="mt-2 text-sm text-slate-500">点餐后，取餐凭证和历史订单会显示在这里。</p>
            <Link
              to="/"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-brand-green px-5 font-semibold text-white"
            >
              去点餐
            </Link>
          </div>
        ) : null}

        <div className="space-y-3">
          {visibleOrders.map((order) => {
            const summary = order.items
              .slice(0, 2)
              .map((item) => `${item.name} x${item.quantity}`)
              .join('，');
            const extraCount = Math.max(0, order.items.length - 2);

            return (
              <Link
                key={order.id}
                to={`/ticket/${order.id}`}
                className="block rounded-lg bg-white p-4 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">取餐号</p>
                    <p className="mt-1 text-4xl font-black">{order.displayNumber}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      order.status === 'completed'
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-brand-mint text-brand-green'
                    }`}
                  >
                    {statusLabel[order.status]}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                  <ShoppingBag size={18} className="shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold">
                      {summary}
                      {extraCount > 0 ? ` 等 ${order.items.length} 件` : ''}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.pickupTime} · 现场应付 {formatMoney(order.total)}
                    </p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-slate-400" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <CustomerTabBar />
    </main>
  );
}
