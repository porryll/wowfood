import { ArrowLeft, Clock3, MessageSquareText, Phone, ReceiptText } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useWowfoodStore } from '../store/useWowfoodStore';
import type { Product, SpiceLevel } from '../types';
import { calculateCartTotal, formatMoney, generatePickupOptions } from '../utils/format';

const spiceLevels: SpiceLevel[] = ['不辣', '微辣', '中辣', '重辣'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const settings = useWowfoodStore((state) => state.settings);
  const products = useWowfoodStore((state) => state.products);
  const cart = useWowfoodStore((state) => state.cart);
  const customerPhone = useWowfoodStore((state) => state.customerPhone);
  const submitOrder = useWowfoodStore((state) => state.submitOrder);
  const [phone, setPhone] = useState(customerPhone);
  const [pickupTime, setPickupTime] = useState('立即取餐');
  const [spice, setSpice] = useState<SpiceLevel>('微辣');
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');
  const acceptingOrders = settings.acceptingOrders ?? true;
  const pauseMessage = settings.pauseMessage || '今天暂不接单，请稍后再来。';

  const pickupOptions = useMemo(() => generatePickupOptions(), []);
  const cartProducts = cart
    .map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter((item): item is { product: Product; quantity: number } => Boolean(item));
  const total = calculateCartTotal(cart, products);

  if (cartProducts.length === 0) {
    return <Navigate to="/" replace />;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedPhone = phone.replace(/\D/g, '');

    if (!acceptingOrders) {
      setError(pauseMessage);
      return;
    }

    if (!/^1\d{10}$/.test(normalizedPhone)) {
      setError('请输入正确的 11 位手机号');
      return;
    }

    try {
      const order = submitOrder({
        phone: normalizedPhone,
        pickupTime,
        spice,
        remark
      });
      navigate(`/ticket/${order.id}`, { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '提交失败');
    }
  }

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
          <h1 className="text-lg font-bold">确认下单</h1>
          <div className="h-10 w-10" />
        </div>
      </header>

      <form className="space-y-3 px-4 py-4" onSubmit={handleSubmit}>
        <section className="rounded-lg bg-white p-4">
          <p className="text-sm text-slate-500">取餐门店</p>
          <h2 className="mt-1 text-xl font-bold">{settings.name}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {acceptingOrders ? '到摊自提，现场付款。' : pauseMessage}
          </p>
        </section>

        <section className="rounded-lg bg-white p-4">
          <div className="mb-3 flex items-center gap-2 text-base font-bold">
            <Clock3 size={18} className="text-brand-green" />
            取货时间
          </div>
          <div className="grid grid-cols-3 gap-2">
            {pickupOptions.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => setPickupTime(option)}
                className={`h-11 rounded-lg border text-sm font-semibold ${
                  pickupTime === option
                    ? 'border-brand-green bg-brand-green text-white'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg bg-white p-4">
          <label className="block">
            <span className="mb-3 flex items-center gap-2 text-base font-bold">
              <Phone size={18} className="text-brand-green" />
              联系电话
            </span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 11))}
              inputMode="tel"
              className="h-12 w-full rounded-lg border border-slate-200 px-4 text-lg outline-none focus:border-brand-green"
              placeholder="请输入 11 位手机号"
            />
          </label>
        </section>

        <section className="rounded-lg bg-white p-4">
          <p className="mb-3 text-base font-bold">辣度</p>
          <div className="grid grid-cols-4 gap-2">
            {spiceLevels.map((level) => (
              <button
                type="button"
                key={level}
                onClick={() => setSpice(level)}
                className={`h-11 rounded-lg border text-sm font-semibold ${
                  spice === level
                    ? 'border-brand-green bg-brand-green text-white'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg bg-white p-4">
          <label className="block">
            <span className="mb-3 flex items-center gap-2 text-base font-bold">
              <MessageSquareText size={18} className="text-brand-green" />
              备注
            </span>
            <textarea
              value={remark}
              onChange={(event) => setRemark(event.target.value.slice(0, 80))}
              className="min-h-24 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-brand-green"
              placeholder="少葱、不要香菜、分开装等"
            />
          </label>
        </section>

        <section className="rounded-lg bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-base font-bold">
            <ReceiptText size={18} className="text-brand-green" />
            菜品明细
          </div>
          <div className="divide-y divide-slate-100">
            {cartProducts.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="line-clamp-1 font-semibold">{product.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{product.unit}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm text-slate-500">x{quantity}</p>
                  <p className="font-bold">{formatMoney(product.price * quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-brand-red">{error}</p> : null}

        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] bg-white px-4 py-3 pb-safe-bottom shadow-bar">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500">现场应付</p>
              <p className="text-2xl font-bold">{formatMoney(total)}</p>
            </div>
            <button
              disabled={!acceptingOrders}
              className="h-12 min-w-36 rounded-lg bg-brand-green px-5 font-semibold text-white disabled:bg-slate-300"
            >
              {acceptingOrders ? '提交预订' : '暂不接单'}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
